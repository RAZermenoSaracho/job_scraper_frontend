/**
 * Full-detail modal for a single job. Job Description HTML comes from our
 * own trusted job_scraper API, so rendering it via dangerouslySetInnerHTML
 * is acceptable here.
 */
export default function JobDetail({ job, onClose, onDiscard, discardDisabled }) {
  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">{job["Job Title"]}</h2>
            <p className="text-sm text-neutral-400">{job["Company Name"]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-neutral-500 hover:text-neutral-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-3 text-sm text-neutral-300">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-neutral-300">Location: </span>
              {job["Job Location"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-neutral-300">Compensation: </span>
              {job["Compensation"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-neutral-300">Tags: </span>
              {job["Tags"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-neutral-300">Notes: </span>
              {job["Notes"] || "—"}
            </p>
          </div>

          <p>
            <a
              href={job["Job Url"]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline break-all"
            >
              {job["Job Url"]}
            </a>
          </p>

          <div>
            <p className="mb-1 font-semibold text-neutral-300">Description</p>
            <div
              className="job-description-html max-w-none text-neutral-300"
              dangerouslySetInnerHTML={{ __html: job["Job Description"] || "" }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDiscard(job)}
            disabled={discardDisabled}
            className="rounded-md border border-red-800 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
