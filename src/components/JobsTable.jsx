/**
 * Renders jobs as a table on medium+ screens and as stacked cards on mobile.
 * Each row/card is clickable to open the job detail view; the discard button
 * stops propagation so it doesn't also trigger the row click.
 */
export default function JobsTable({ jobs, onSelectJob, onDiscardJob }) {
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

  return (
    <>
      {/* Table layout for sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 shadow-sm sm:block">
        <table className="min-w-full divide-y divide-neutral-800 text-sm">
          <thead className="bg-neutral-800/60">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Job Title</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Company Name</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Job Location</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Compensation</th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-300">Tags</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {jobs.map((job) => (
              <tr
                key={job["Job Url"]}
                onClick={() => onSelectJob(job)}
                className="cursor-pointer hover:bg-neutral-800/70"
              >
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="space-y-3 sm:hidden">
        {jobs.map((job) => (
          <div
            key={job["Job Url"]}
            onClick={() => onSelectJob(job)}
            className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm hover:bg-neutral-800/70"
          >
            <p className="font-semibold text-neutral-100">{job["Job Title"]}</p>
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
        ))}
      </div>
    </>
  );
}
