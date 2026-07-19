/**
 * Renders jobs as a table on medium+ screens and as stacked cards on mobile.
 * Each row/card is clickable to open the job detail view; the checkbox and
 * discard button stop propagation so they don't also trigger the row click.
 *
 * A job entry can also be one of two placeholder states, both keyed by
 * `__key` instead of `Job Url` since there's no real job behind them:
 *  - `__searching: true` — queued or in flight in the replacement batch,
 *    renders as a spinner row.
 *  - `__noReplacement: true` — the batch came back without enough
 *    candidates to fill this slot; renders with a "Dismiss" action instead
 *    of spinning forever.
 *
 * Discard buttons are always enabled — replacement searches for other jobs
 * never block acting on the rest of the table (they're queued and batched,
 * see App.jsx's discard queue).
 */
export default function JobsTable({
  jobs,
  onSelectJob,
  onDiscardJob,
  selectedUrls,
  onToggleSelect,
  onDismissSlot,
}) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
        No jobs to show. Run a search to fetch results.
      </div>
    );
  }

  function handleDiscardClick(event, job) {
    event.stopPropagation();
    onDiscardJob(job);
  }

  function handleCheckboxClick(event, url) {
    event.stopPropagation();
    onToggleSelect(url);
  }

  function handleDismissClick(event, key) {
    event.stopPropagation();
    onDismissSlot(key);
  }

  return (
    <>
      {/* Table layout for sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 shadow-sm sm:block">
        <table className="min-w-full divide-y divide-neutral-800 text-sm">
          <thead className="bg-neutral-800/60">
            <tr>
              <th className="w-8 px-4 py-2"></th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Job Title</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Company Name</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Job Location</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Compensation</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Tags</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {jobs.map((job) => {
              if (job.__searching) {
                return (
                  <tr key={job.__key} className="bg-neutral-900/60">
                    <td colSpan={7} className="px-4 py-3 text-neutral-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
                        Searching for a replacement...
                      </span>
                    </td>
                  </tr>
                );
              }

              if (job.__noReplacement) {
                return (
                  <tr key={job.__key} className="bg-neutral-900/60">
                    <td colSpan={6} className="px-4 py-3 text-neutral-500">
                      No replacement available.
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={(event) => handleDismissClick(event, job.__key)}
                        className="rounded-md border border-neutral-700 px-2 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                      >
                        Dismiss
                      </button>
                    </td>
                  </tr>
                );
              }

              const url = job["Job Url"];
              return (
                <tr
                  key={url}
                  onClick={() => onSelectJob(job)}
                  className="cursor-pointer hover:bg-neutral-800/70"
                >
                  <td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedUrls.includes(url)}
                      onChange={(event) => handleCheckboxClick(event, url)}
                      aria-label={`Select ${job["Job Title"]}`}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-neutral-100">{job["Job Title"]}</td>
                  <td className="px-4 py-2 text-neutral-300">{job["Company Name"]}</td>
                  <td className="px-4 py-2 text-neutral-300">{job["Job Location"]}</td>
                  <td className="px-4 py-2 text-neutral-300">{job["Compensation"] || "—"}</td>
                  <td className="px-4 py-2 text-neutral-300">{job["Tags"]}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={(event) => handleDiscardClick(event, job)}
                      className="rounded-md border border-red-800 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-950/50"
                    >
                      Discard
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="space-y-3 sm:hidden">
        {jobs.map((job) => {
          if (job.__searching) {
            return (
              <div
                key={job.__key}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400 shadow-sm"
              >
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
                Searching for a replacement...
              </div>
            );
          }

          if (job.__noReplacement) {
            return (
              <div
                key={job.__key}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-500 shadow-sm"
              >
                No replacement available.
                <button
                  type="button"
                  onClick={(event) => handleDismissClick(event, job.__key)}
                  className="rounded-md border border-neutral-700 px-2 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                >
                  Dismiss
                </button>
              </div>
            );
          }

          const url = job["Job Url"];
          return (
            <div
              key={url}
              onClick={() => onSelectJob(job)}
              className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm hover:bg-neutral-800/70"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-neutral-100">{job["Job Title"]}</p>
                <input
                  type="checkbox"
                  checked={selectedUrls.includes(url)}
                  onChange={(event) => handleCheckboxClick(event, url)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select ${job["Job Title"]}`}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-600 bg-neutral-950 accent-blue-600"
                />
              </div>
              <p className="text-sm text-neutral-300">{job["Company Name"]}</p>
              <p className="text-sm text-neutral-500">{job["Job Location"]}</p>
              <p className="text-sm text-neutral-500">{job["Compensation"] || "—"}</p>
              <p className="mt-1 text-xs text-neutral-500">{job["Tags"]}</p>
              <button
                type="button"
                onClick={(event) => handleDiscardClick(event, job)}
                className="mt-3 rounded-md border border-red-800 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-950/50"
              >
                Discard
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
