const STAGE_LABELS = {
  searching_keywords: "Searching for job listings...",
  scraping: "Analyzing listings...",
  filtering: "Filtering results...",
};

function describeStage(stage, current, total) {
  const label = STAGE_LABELS[stage] || stage || "Working...";
  if (total > 0) {
    return `${label.replace(/\.\.\.$/, "")} (${current}/${total})`;
  }
  return label;
}

/**
 * Shows scrape progress while a job is running. Falls back to an
 * indeterminate/animated bar when total is 0 (e.g. during
 * "searching_keywords", before the total job count is known).
 */
export default function ProgressBar({ stage, current, total }) {
  const hasTotal = total > 0;
  const percent = hasTotal ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium text-gray-700">
        {describeStage(stage, current, total)}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        {hasTotal ? (
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        ) : (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        )}
      </div>
    </div>
  );
}
