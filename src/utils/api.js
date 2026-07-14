import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8420";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetches jobs from the job_scraper API.
 * Throws an Error whose message is the API's "detail" field when available.
 */
export async function fetchJobs(requestBody) {
  try {
    const response = await client.post("/jobs", requestBody);
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    throw new Error(detail || error.message || "Failed to fetch jobs.");
  }
}
