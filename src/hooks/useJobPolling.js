import { useEffect, useRef } from "react";
import { getJobStatus, getJobResult } from "../utils/api.js";

const POLL_INTERVAL_MS = 2000;

/**
 * Polls GET /jobs/{jobId}/status every 2s, reporting progress via
 * `onProgress` on each tick, until the job reaches a terminal state.
 * Resolves with the job array on "done"; rejects (tagged isJobError) on
 * "error". Each call to this hook gets its own interval ref, so two
 * independent pollers (e.g. the full search and the discard queue) never
 * share — and clobber — the same interval.
 */
export function useJobPolling() {
  const intervalRef = useRef(null);

  // Stop polling on unmount so an in-flight job doesn't keep ticking after
  // the component is gone.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function poll(jobId, onProgress) {
    if (intervalRef.current) clearInterval(intervalRef.current);

    return new Promise((resolve, reject) => {
      intervalRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          if (status.status === "done") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            const result = await getJobResult(jobId);
            resolve(result);
            return;
          }

          if (status.status === "error") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            const jobError = new Error(status.error || "The search failed.");
            jobError.isJobError = true;
            reject(jobError);
            return;
          }

          onProgress({ stage: status.stage, current: status.current, total: status.total });
        } catch (err) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          reject(err);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  return poll;
}
