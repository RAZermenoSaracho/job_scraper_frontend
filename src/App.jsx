import { useState } from "react";
import ConfigForm from "./components/ConfigForm.jsx";
import JobsTable from "./components/JobsTable.jsx";
import JobDetail from "./components/JobDetail.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import Toast from "./components/Toast.jsx";
import { useJobConfig } from "./hooks/useJobConfig.js";
import { useDiscardedUrls } from "./hooks/useDiscardedUrls.js";
import { useJobsState } from "./hooks/useJobsState.js";
import { useJobSearch } from "./hooks/useJobSearch.js";
import { useDiscardQueue } from "./hooks/useDiscardQueue.js";
import { isRealJob } from "./utils/jobSlots.js";
import { exportJobsToExcel } from "./utils/excelExport.js";

export default function App() {
  const [config, setConfig] = useJobConfig();
  const [discardedUrls, setDiscardedUrls] = useDiscardedUrls();

  const { jobs, updateJobs, jobsRef } = useJobsState();
  // Shared by the full search and the discard queue so the same
  // <ProgressBar> below lights up for either — see useDiscardQueue's doc
  // comment for why this isn't owned inside useJobSearch instead.
  const [progress, setProgress] = useState(null);

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  }

  const { loading, error, handleSearch } = useJobSearch(config, discardedUrls, {
    updateJobs,
    showToast,
    setProgress,
    onSearchStart: () => setSelectedUrls([]),
  });

  // Called by discardJobs right before it swaps the discarded jobs' slots
  // for placeholders: closes the detail modal if it was open on one of
  // them, and drops them from the checkbox selection.
  function clearSelectionFor(urls) {
    if (selectedJob && urls.includes(selectedJob["Job Url"])) {
      setSelectedJob(null);
    }
    setSelectedUrls((prev) => prev.filter((url) => !urls.includes(url)));
  }

  const { discardJobs } = useDiscardQueue({
    config,
    discardedUrls,
    setDiscardedUrls,
    jobsRef,
    updateJobs,
    showToast,
    setProgress,
    onDiscard: clearSelectionFor,
  });

  function handleDiscard(job) {
    discardJobs([job]);
  }

  function toggleSelected(url) {
    setSelectedUrls((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  function handleDiscardSelection() {
    const jobsToDiscard = jobs.filter((job) => isRealJob(job) && selectedUrls.includes(job["Job Url"]));
    discardJobs(jobsToDiscard);
  }

  function handleDismissSlot(key) {
    updateJobs((prevJobs) => prevJobs.filter((job) => !(job.__noReplacement && job.__key === key)));
  }

  function handleExport() {
    exportJobsToExcel(jobs.filter(isRealJob));
  }

  const realJobsCount = jobs.filter(isRealJob).length;
  const selectedCount = selectedUrls.length;

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
        <ConfigForm config={config} onChange={setConfig} onSearch={handleSearch} loading={loading} />

        {progress && <ProgressBar {...progress} />}

        {error && (
          <div className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-neutral-100">
            Results {realJobsCount > 0 && `(${realJobsCount})`}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDiscardSelection}
              disabled={selectedCount === 0}
              className="rounded-md border border-red-800 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard selection {selectedCount > 0 && `(${selectedCount})`}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={realJobsCount === 0}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-800" />
            ))}
          </div>
        ) : (
          <JobsTable
            jobs={jobs}
            onSelectJob={setSelectedJob}
            onDiscardJob={handleDiscard}
            selectedUrls={selectedUrls}
            onToggleSelect={toggleSelected}
            onDismissSlot={handleDismissSlot}
          />
        )}
      </main>

      <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} onDiscard={handleDiscard} />
      <Toast message={toastMessage} />
    </div>
  );
}
