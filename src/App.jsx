import { useState } from "react";
import ConfigForm from "./components/ConfigForm.jsx";
import JobsTable from "./components/JobsTable.jsx";
import JobDetail from "./components/JobDetail.jsx";
import Toast from "./components/Toast.jsx";
import { useJobConfig } from "./hooks/useJobConfig.js";
import { useDiscardedUrls } from "./hooks/useDiscardedUrls.js";
import { fetchJobs } from "./utils/api.js";
import { exportJobsToExcel } from "./utils/excelExport.js";

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
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  }

  async function runSearch(discardedUrlsForRequest) {
    setLoading(true);
    setError("");
    try {
      const body = buildRequestBody(config, discardedUrlsForRequest);
      const data = await fetchJobs(body);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Job Scraper</h1>
          <p className="text-sm text-gray-500">
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

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Results {jobs.length > 0 && `(${jobs.length})`}
          </h2>
          <button
            type="button"
            onClick={handleExport}
            disabled={jobs.length === 0}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download Excel
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200" />
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
