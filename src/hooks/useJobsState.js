import { useRef, useState } from "react";

/**
 * Owns the canonical `jobs` array, shared between the full search
 * (useJobSearch) and the discard queue (useDiscardQueue) rather than
 * duplicated in each. `updateJobs` computes the next value from
 * `jobsRef.current` (not React's own prevJobs) and updates the ref
 * synchronously *before* calling setJobs, since React doesn't guarantee a
 * functional setState updater runs synchronously — if it were deferred, a
 * second updateJobs call issued in the same tick (e.g. two discards fired
 * back-to-back) could still read the stale ref. `jobsRef` matters
 * specifically for the discard queue's recursive async chain
 * (processQueue -> runBatchReplacement -> processQueue -> ...), which spans
 * real network round-trips and would otherwise read whatever `jobs` value
 * was captured in the closure of the render that kicked off the chain.
 *
 * Anything that mutates `jobs` must go through `updateJobs`, not `setJobs`
 * directly, or `jobsRef` desyncs from what's on screen.
 */
export function useJobsState() {
  const [jobs, setJobs] = useState([]);
  const jobsRef = useRef(jobs);

  function updateJobs(updater) {
    const nextJobs = typeof updater === "function" ? updater(jobsRef.current) : updater;
    jobsRef.current = nextJobs;
    setJobs(nextJobs);
  }

  return { jobs, updateJobs, jobsRef };
}
