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

- **Discard flow, with batched replacements** — clicking "Discard" (table
  row or detail modal), or checking rows and clicking "Discard selection":
  1. Every discarded job's `Job Url` is added to the `discarded_urls` array,
     persisted separately in `localStorage` (key
     `job_scraper_discarded_urls`) via the `useDiscardedUrls` hook.
  2. Each discarded job's row is replaced in place, immediately, by a
     "Searching for a replacement..." placeholder — the rest of the table is
     untouched, no full-page reload or skeleton. Multiple placeholders can
     be on screen at once.
  3. Discard/Search buttons are **never** disabled by a replacement search
     for other jobs — you can keep discarding while one is in flight.
  4. Replacement requests are coalesced through a small queue instead of
     firing one `POST /jobs` per discard: if no replacement call is
     currently running, the just-discarded job(s) fire one immediately
     (`max_jobs_saved: N`, N = however many were just discarded together).
     If a call **is** already running, they're added to a pending queue
     instead. The moment the running call finishes, everything accumulated
     in the queue since it started fires as a single new batch call — so
     several individual discards made in quick succession end up resolved
     by one request, not one each.
  5. `discarded_urls` sent with any of these requests (single or batch) is
     always the permanent list plus every job currently visible elsewhere in
     the table, temporarily added just for that one request (not persisted),
     so replacements can't duplicate something already shown.
  6. When a batch's response comes back, the returned jobs are distributed
     into the matching placeholder slots in the same order those jobs were
     discarded/queued. If a batch returns fewer jobs than requested (or the
     request fails), the leftover slot(s) show a "No replacement available."
     row with a "Dismiss" button instead of spinning forever.
  7. The existing progress bar (used for the full search) is reused for
     every one of these calls — single-job replacements and every batch
     call — and reflects whichever call is currently active.

- **Multi-select** — each row/card has a checkbox; "Discard selection" in
  the results header shows the current count (e.g. "Discard selection (3)"),
  is disabled with nothing selected, and feeds the same discard queue
  described above.

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
