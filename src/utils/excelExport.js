import * as XLSX from "xlsx";

function buildNotes(job) {
  const compensation = job["Compensation"];
  if (compensation) {
    return `Salary: ${compensation}`;
  }
  return job["Notes"] || "";
}

function todayFilenameSuffix() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}_${month}_${day}`;
}

/**
 * Generates and downloads an .xlsx file from the given jobs, client-side only.
 */
export function exportJobsToExcel(jobs) {
  const rows = jobs.map((job) => ({
    "Job Title": job["Job Title"] || "",
    "Company Name": job["Company Name"] || "",
    "Job Description": job["Job Description"] || "",
    "Job Location": job["Job Location"] || "",
    "Job Url": job["Job Url"] || "",
    Tags: job["Tags"] || "",
    Notes: buildNotes(job),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Job Title",
      "Company Name",
      "Job Description",
      "Job Location",
      "Job Url",
      "Tags",
      "Notes",
    ],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

  const filename = `job_scraper_results_${todayFilenameSuffix()}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
