import { useState } from "react";
import { startScrapeJob } from "../utils/api.js";
import { buildRequestBody } from "../utils/jobRequest.js";
import { useJobPolling } from "./useJobPolling.js";

/**
 * Encapsulates the full-search flow (the "Search" button): its own loading
 * skeleton and inline error banner. `jobs`/`updateJobs` and `progress` are
 * NOT owned here — they're shared with the discard queue (see App.jsx),
 * so they live one level up and are passed in instead of being duplicated
 * per-hook. `loading` and `error`, on the other hand, are genuinely
 * specific to the full search, so they're owned locally.
 */
export function useJobSearch(config, discardedUrls, { updateJobs, showToast, setProgress, onSearchStart }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const poll = useJobPolling();

  async function runSearch(discardedUrlsForRequest) {
    setLoading(true);
    setError("");
    setProgress(null);
    onSearchStart();
    try {
      const body = buildRequestBody(config, discardedUrlsForRequest);
      const { job_id } = await startScrapeJob(body);
      const result = await poll(job_id, setProgress);
      updateJobs(Array.isArray(result?.jobs) ? result.jobs : []);
    } catch (err) {
      if (err.isJobError) {
        showToast(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function handleSearch() {
    runSearch(discardedUrls);
  }

  return { loading, error, handleSearch };
}
