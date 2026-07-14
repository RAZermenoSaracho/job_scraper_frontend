/**
 * Full-detail modal for a single job. Job Description HTML comes from our
 * own trusted job_scraper API, so rendering it via dangerouslySetInnerHTML
 * is acceptable here.
 */
export default function JobDetail({ job, onClose, onDiscard }) {
  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{job["Job Title"]}</h2>
            <p className="text-sm text-gray-600">{job["Company Name"]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-gray-700">Location: </span>
              {job["Job Location"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Compensation: </span>
              {job["Compensation"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Tags: </span>
              {job["Tags"] || "—"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Notes: </span>
              {job["Notes"] || "—"}
            </p>
          </div>

          <p>
            <a
              href={job["Job Url"]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {job["Job Url"]}
            </a>
          </p>

          <div>
            <p className="mb-1 font-semibold text-gray-700">Description</p>
            <div
              className="job-description-html max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: job["Job Description"] || "" }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDiscard(job)}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
