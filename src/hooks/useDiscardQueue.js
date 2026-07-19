import { useEffect, useRef } from "react";
import { startScrapeJob } from "../utils/api.js";
import { buildRequestBody } from "../utils/jobRequest.js";
import { makePlaceholder, makeNoReplacement, isRealJob } from "../utils/jobSlots.js";
import { useJobPolling } from "./useJobPolling.js";

/**
 * Encapsulates the discard-and-replace queue: discarding one or more jobs
 * swaps their slots for placeholders immediately, then coalesces their
 * replacement requests into as few POST /jobs calls as possible instead of
 * firing one per discard. There is no global lock — Discard/Search buttons
 * are never disabled because a replacement search for some *other* job is
 * running; the queue exists specifically so that's safe. Exposes only
 * `discardJobs` — everything else (the queue, the in-flight flag, the batch
 * call itself) is an internal implementation detail.
 *
 * `jobsRef`/`updateJobs` come from useJobsState (shared with useJobSearch);
 * `setProgress` comes from the same shared progress state useJobSearch
 * writes to, so the one <ProgressBar> in App.jsx lights up for the full
 * search, a lone replacement, and every batch call alike.
 */
export function useDiscardQueue({
  config,
  discardedUrls,
  setDiscardedUrls,
  jobsRef,
  updateJobs,
  showToast,
  setProgress,
  onDiscard,
}) {
  // `discardedUrls` mirrored into a ref for the same reason `jobsRef` exists
  // in useJobsState: runBatchReplacement/processQueue run across `await`s,
  // so by the time a recursive processQueue() call fires, the discardedUrls
  // closed over by that function instance may be several renders stale.
  const discardedUrlsRef = useRef(discardedUrls);
  useEffect(() => {
    discardedUrlsRef.current = discardedUrls;
  }, [discardedUrls]);

  // Replacement requests for discarded jobs are queued and coalesced into a
  // single POST /jobs (max_jobs_saved: N) per round — see discardJobs below.
  // Plain refs, not state, because the queue is driven by a recursive async
  // chain (processQueue calling itself from its own finally block) that
  // spans real network round-trips; using useState here would mean reading
  // stale values from whichever render's closure happened to kick off the
  // chain.
  const pendingDiscardQueueRef = useRef([]);
  const batchInFlightRef = useRef(false);

  const poll = useJobPolling();

  // Fetches exactly `urls.length` replacement jobs in one call and
  // distributes them into the matching placeholder slots, in the same
  // order `urls` were discarded/queued. Slots that don't get a candidate
  // back (fewer results than requested, or the request failed outright)
  // become a `__noReplacement` terminal state instead of spinning forever.
  async function runBatchReplacement(urls) {
    setProgress(null);
    try {
      const excludedUrls = jobsRef.current.filter(isRealJob).map((job) => job["Job Url"]);
      const body = buildRequestBody(config, [...discardedUrlsRef.current, ...excludedUrls], {
        max_jobs_saved: urls.length,
      });
      const { job_id } = await startScrapeJob(body);
      const result = await poll(job_id, setProgress);
      const candidates = Array.isArray(result?.jobs) ? result.jobs : [];

      const seenUrls = new Set(excludedUrls);
      const replacements = [];
      for (const candidate of candidates) {
        const candidateUrl = candidate["Job Url"];
        if (seenUrls.has(candidateUrl)) continue;
        seenUrls.add(candidateUrl);
        replacements.push(candidate);
        if (replacements.length === urls.length) break;
      }

      updateJobs((prevJobs) => {
        const nextJobs = [...prevJobs];
        urls.forEach((url, i) => {
          const index = nextJobs.findIndex((job) => job.__searching && job.__key === url);
          if (index === -1) return;
          nextJobs[index] = replacements[i] || makeNoReplacement(url);
        });
        return nextJobs;
      });

      if (replacements.length < urls.length) {
        showToast(
          replacements.length === 0
            ? "No replacement jobs found."
            : `Found replacements for ${replacements.length} of ${urls.length} discarded jobs.`
        );
      }
    } catch (err) {
      updateJobs((prevJobs) => {
        const nextJobs = [...prevJobs];
        urls.forEach((url) => {
          const index = nextJobs.findIndex((job) => job.__searching && job.__key === url);
          if (index !== -1) nextJobs[index] = makeNoReplacement(url);
        });
        return nextJobs;
      });
      showToast(err.message || "Failed to search for replacements.");
    } finally {
      setProgress(null);
    }
  }

  // Drains the queue one round at a time: whatever accumulated while the
  // previous batch was in flight becomes the next single POST /jobs call.
  async function processQueue() {
    if (batchInFlightRef.current) return;
    const urls = pendingDiscardQueueRef.current;
    if (urls.length === 0) return;

    pendingDiscardQueueRef.current = [];
    batchInFlightRef.current = true;
    try {
      await runBatchReplacement(urls);
    } finally {
      batchInFlightRef.current = false;
      if (pendingDiscardQueueRef.current.length > 0) {
        processQueue();
      }
    }
  }

  function enqueueDiscards(urls) {
    pendingDiscardQueueRef.current = [...pendingDiscardQueueRef.current, ...urls];
    if (!batchInFlightRef.current) {
      processQueue();
    }
  }

  // Shared by single-job discard and "Discard selection": swaps every given
  // job's slot for a placeholder immediately, then hands their URLs to the
  // replacement queue. Never blocks on a call already in flight — that's
  // exactly what the queue is for.
  function discardJobs(jobsToDiscard) {
    if (jobsToDiscard.length === 0) return;
    const urls = jobsToDiscard.map((job) => job["Job Url"]);

    const newlyDiscarded = urls.filter((url) => !discardedUrlsRef.current.includes(url));
    if (newlyDiscarded.length > 0) {
      const updated = [...discardedUrlsRef.current, ...newlyDiscarded];
      discardedUrlsRef.current = updated;
      setDiscardedUrls(updated);
    }

    onDiscard(urls);

    updateJobs((prevJobs) =>
      prevJobs.map((job) => (urls.includes(job["Job Url"]) ? makePlaceholder(job["Job Url"]) : job))
    );

    showToast(
      urls.length === 1
        ? "Job discarded — searching for a replacement..."
        : `${urls.length} jobs discarded — searching for replacements...`
    );

    enqueueDiscards(urls);
  }

  return { discardJobs };
}
