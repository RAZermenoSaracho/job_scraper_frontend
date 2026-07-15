import { useEffect, useRef, useState } from "react";
import ConfigForm from "./components/ConfigForm.jsx";
import JobsTable from "./components/JobsTable.jsx";
import JobDetail from "./components/JobDetail.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import Toast from "./components/Toast.jsx";
import { useJobConfig } from "./hooks/useJobConfig.js";
import { useDiscardedUrls } from "./hooks/useDiscardedUrls.js";
import { startScrapeJob, getJobStatus, getJobResult } from "./utils/api.js";
import { exportJobsToExcel } from "./utils/excelExport.js";

const POLL_INTERVAL_MS = 2000;

function buildRequestBody(config, discardedUrls) {
  return {
    keywords: config.keywords,
    acceptable_locations: config.acceptable_locations,
    anti_keywords: config.anti_keywords,
    discarded_urls: discardedUrls,
    max_jobs_searched_per_keyword: config.max_jobs_searched_per_keyword,
    max_jobs_saved: config.max_jobs_saved,
    max_experience_years: config.max_experience_years,
  };
}

export default function App() {
  const [config, setConfig] = useJobConfig();
  const [discardedUrls, setDiscardedUrls] = useDiscardedUrls();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const pollIntervalRef = useRef(null);

  // Stop polling on unmount so an in-flight job doesn't keep ticking after
  // the component is gone.
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  }

  // Polls GET /jobs/{jobId}/status every 2s, updating `progress` on each
  // tick, until the job reaches a terminal state. Resolves with the job
  // array on "done"; rejects (tagged isJobError) on "error".
  function pollJobStatus(jobId) {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    return new Promise((resolve, reject) => {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          if (status.status === "done") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            const result = await getJobResult(jobId);
            resolve(result);
            return;
          }

          if (status.status === "error") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            const jobError = new Error(status.error || "The search failed.");
            jobError.isJobError = true;
            reject(jobError);
            return;
          }

          setProgress({ stage: status.stage, current: status.current, total: status.total });
        } catch (err) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          reject(err);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  async function runSearch(discardedUrlsForRequest) {
    setLoading(true);
    setError("");
    setProgress(null);
    try {
      const body = buildRequestBody(config, discardedUrlsForRequest);
      const { job_id } = await startScrapeJob(body);
      const result = await pollJobStatus(job_id);
      setJobs(Array.isArray(result?.jobs) ? result.jobs : []);
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

  async function handleDiscard(job) {
    const url = job["Job Url"];
    const updatedDiscardedUrls = discardedUrls.includes(url)
      ? discardedUrls
      : [...discardedUrls, url];
    setDiscardedUrls(updatedDiscardedUrls);

    if (selectedJob && selectedJob["Job Url"] === url) {
      setSelectedJob(null);
    }

    showToast("Job discarded — searching for a replacement...");
    await runSearch(updatedDiscardedUrls);
  }

  function handleExport() {
    exportJobsToExcel(jobs);
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-bold text-neutral-100">Job Scraper</h1>
          <p className="text-sm text-neutral-400">
            Configure your search, review results, and export the ones you like.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <ConfigForm
          config={config}
          onChange={setConfig}
          onSearch={handleSearch}
          loading={loading}
        />

        {progress && <ProgressBar {...progress} />}

        {error && (
          <div className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-100">
            Results {jobs.length > 0 && `(${jobs.length})`}
          </h2>
          <button
            type="button"
            onClick={handleExport}
            disabled={jobs.length === 0}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download Excel
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-800" />
            ))}
          </div>
        ) : (
          <JobsTable jobs={jobs} onSelectJob={setSelectedJob} onDiscardJob={handleDiscard} />
        )}
      </main>

      <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} onDiscard={handleDiscard} />
      <Toast message={toastMessage} />
    </div>
  );
}
