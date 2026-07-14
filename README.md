# Job Scraper Frontend

A small, personal single-page frontend for reviewing job postings (Web3, DeFi,
quant trading) fetched from the `job_scraper` API. It lets you configure a
search, review the results in a table, discard postings that aren't a fit
(triggering a fresh search for a replacement), and export a shortlist to
Excel to track your job search.

This repo contains **no scraping or backend logic** — it is purely the visual
interface that builds requests against the `job_scraper` API and displays
results. The API is a separate, independent repository.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (functional
  components, hooks only)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [axios](https://axios-http.com/) as the HTTP client
- [xlsx (SheetJS)](https://www.npmjs.com/package/xlsx) for client-side Excel
  export — no backend involvement
- Plain `useState` for state, no external state manager

## Running in development

```bash
npm install
npm run dev
```

This starts the Vite dev server (defaults to `http://localhost:5173`).

## Configuring the API URL

The frontend talks directly to the `job_scraper` API. The base URL is read
from the `VITE_API_BASE_URL` environment variable — never hardcoded.

```bash
cp .env.example .env
# edit .env if your job_scraper API isn't running on the default port
```

If `VITE_API_BASE_URL` isn't set, it falls back to `http://localhost:8420`
for local development convenience.

## Building for production

```bash
npm run build
npm run preview   # serve the built dist/ locally to sanity-check
```

## Features

- **Search configuration panel** (`ConfigForm`) — a collapsible panel with
  number inputs for `max_jobs_saved`, `max_jobs_searched_per_keyword`, and
  `max_experience_years`, plus chip/tag inputs (`ChipInput`) for `keywords`,
  `acceptable_locations`, and `anti_keywords`. The whole config is persisted
  to `localStorage` (key `job_scraper_config`) via the `useJobConfig` hook,
  so reloading the page doesn't lose your setup. It's pre-filled with a
  couple of example values the first time you open the app.

- **Results table** (`JobsTable`) — shows `Job Title`, `Company Name`,
  `Job Location`, `Compensation`, and `Tags` for each job. Renders as a real
  `<table>` on wider screens and stacked cards on mobile. Clicking a
  row/card opens the full detail view.

- **Job detail view** (`JobDetail`) — a modal showing every field for a
  single job, including the `Job Description` rendered as real HTML (the
  API returns trusted HTML markup, rendered via `dangerouslySetInnerHTML`).
  Has its own Discard button and closes on click-outside or the close
  button.

- **Search / Refresh** — the Search button in the config panel builds the
  full request body (including the current `discarded_urls`) and does
  `POST /jobs`, replacing the table's results. Shows a skeleton loading
  state while the request is in flight and surfaces the API's `detail`
  field inline if the request fails.

- **Discard flow** — clicking "Discard" (from the table row or the detail
  modal):
  1. Adds that job's `Job Url` to the `discarded_urls` array, persisted
     separately in `localStorage` (key `job_scraper_discarded_urls`) via the
     `useDiscardedUrls` hook, so it survives independently from the search
     config.
  2. Immediately re-runs `POST /jobs` with the same config and the updated
     `discarded_urls`, replacing the table results.
  3. If you were viewing that job's detail modal, it closes automatically.
  4. Shows a brief toast confirming the discard and that a replacement is
     being searched for.

- **Excel export** (`utils/excelExport.js`) — the "Download Excel" button
  generates an `.xlsx` file client-side with columns `Job Title`,
  `Company Name`, `Job Description`, `Job Location`, `Job Url`, `Tags`, and
  `Notes`. If a job has a non-empty `Compensation`, the `Notes` column is
  set to `Salary: <compensation>`; otherwise it's left as the job's own
  `Notes` value. The filename includes the current date, e.g.
  `job_scraper_results_2026_07_13.xlsx`.

## Notes

- `npm audit` flags `xlsx` for vulnerabilities related to *parsing*
  untrusted spreadsheet files. This app only *writes* `.xlsx` files
  client-side and never parses one, so this doesn't apply here.
- No automated tests are included by design — this is a personal,
  single-user tool that's tested manually.
