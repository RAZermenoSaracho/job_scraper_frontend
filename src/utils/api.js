import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8420";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function toApiError(error, fallbackMessage) {
  const detail = error.response?.data?.detail;
  return new Error(detail || error.message || fallbackMessage);
}

/**
 * Starts an async scrape job. The API responds immediately (202) with a
 * job_id — the actual scraping (2-4 min) happens out of band and must be
 * polled via getJobStatus/getJobResult.
 */
export async function startScrapeJob(requestBody) {
  try {
    const response = await client.post("/jobs", requestBody);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to start the search.");
  }
}

/** Polls the status of a running scrape job. */
export async function getJobStatus(jobId) {
  try {
    const response = await client.get(`/jobs/${jobId}/status`);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch job status.");
  }
}

/**
 * Fetches the final job list. Only valid once status is "done". Resolves to
 * `{ keywords: [...], jobs: [...] }` — callers need the `jobs` array, not
 * the whole object.
 */
export async function getJobResult(jobId) {
  try {
    const response = await client.get(`/jobs/${jobId}/result`);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch job results.");
  }
}
