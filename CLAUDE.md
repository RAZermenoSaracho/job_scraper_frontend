
# CLAUDE.md

This file guides Claude Code when working in this repository.

## What this project is

Frontend built with Vite + React + Tailwind CSS that consumes the `job_scraper`

API (a separate, independent repo not included here). This repo contains NO

scraping or backend logic — it is purely the visual interface that builds

requests and displays results.

## Language rule — IMPORTANT

- **All code, comments, variable/function names, commit messages, and any text

  generated in this repo must be written in English**, regardless of the

  language used in this conversation. This applies to everything: source code,

  README, CLAUDE.md updates, UI copy shown to the user, error messages, etc.

## Git rules — IMPORTANT

- **Always work on the `main` branch. NEVER create, switch to, or suggest

  switching to another branch** (do not use `git checkout -b`, do not use

  `git switch -c`, do not propose feature branches or pull requests). All

  commits go directly to `main`.

- Do not `git push --force` or rewrite history (`rebase`, `commit --amend` on

  already-pushed commits) unless I explicitly ask for it.

- Make small, descriptive commits as you complete each task, not one giant

  commit at the end, unless I say otherwise.

- Never `git push` without my explicit confirmation in chat, unless I tell you

  otherwise for a specific task.

## Tech stack

- **Build tool**: Vite

- **Framework**: React (functional components, hooks — no class components)

- **Styling**: Tailwind CSS (simple utility classes, no elaborate design system)

- **State**: useState / useContext. Do NOT add Redux, Zustand, or any external

  state manager unless I explicitly ask — this app's state is simple and

  doesn't need it.

- **Excel export**: `xlsx` library (SheetJS), generated client-side in the

  browser — not requested from the backend.

- **HTTP**: native fetch or axios (your choice, but be consistent across the

  whole project once chosen).

## How it talks to the API

- The API base URL comes from the `VITE_API_BASE_URL` environment variable

  (see `.env.example`). Never hardcode the API URL in the code.

- Single endpoint: `POST /jobs`. The full request body (keywords,

  acceptable_locations, anti_keywords, discarded_urls,

  max_jobs_searched_per_keyword, max_jobs_saved, max_experience_years) is built

  entirely on the frontend from UI state — the API is stateless and stores

  nothing between requests.

- `discarded_urls` lives in the browser's `localStorage`, not in the backend.

## Code conventions

- Folder structure inside `src/`: `components/`, `hooks/`, `utils/` (or

  whatever organization already exists in the repo — check before assuming).

- Component names in PascalCase, `.jsx` files.

- Avoid over-engineering: this is a small, single-user project (just me), it

  doesn't need abstractions meant to scale to a large team.

- Don't add linters, formatters, or CI/CD config unless I ask for it.

## What NOT to do unless I explicitly ask

- Don't add testing (unit tests, e2e, etc.) — I test manually.

- Don't add authentication, login, or user management — this frontend is for

  personal use only.

- Don't add a backend-for-frontend or proxy — the frontend talks directly to

  the `job_scraper` API via `VITE_API_BASE_URL`.

- Don't install heavy dependencies (full UI kits like MUI, Ant Design, etc.) —

  plain Tailwind is enough for this project.

- Don't switch branches, don't create new branches, don't propose branching

  workflows.

## Business context (in case it's relevant to any UX decision)

This frontend is a personal tool for reviewing job postings (Web3, DeFi, quant

trading) scraped automatically, filtering them, and discarding the ones that

aren't a fit — with the goal of exporting a short, relevant list to Excel to

track progress in the job search.

## Actual project state (filled in after initial build)

This section documents concrete decisions made while scaffolding the project,

so future edits stay consistent with them.

### HTTP client

**axios**, wrapped in `src/utils/api.js` (`fetchJobs(requestBody)`). It reads

`VITE_API_BASE_URL` via `import.meta.env`, falling back to

`http://localhost:8420` for local dev. On failure it throws an `Error` whose

`message` is the API's `detail` field when present — callers should just show

`err.message` to the user, no need to re-parse the response.

### Folder structure

```

src/

  components/     ConfigForm.jsx, ChipInput.jsx, JobsTable.jsx, JobDetail.jsx, Toast.jsx

  hooks/          useJobConfig.js, useDiscardedUrls.js

  utils/          api.js, excelExport.js, localStorage.js

  App.jsx         top-level wiring, owns jobs/loading/error/selectedJob/toast state

  main.jsx        React entry point

  index.css       Tailwind directives + minimal styling for raw HTML job descriptions

```

There is no `context/` usage yet — `App.jsx` is small enough that plain

`useState` plus props is sufficient. Only introduce `useContext` if prop

drilling actually becomes painful, not preemptively.

### State management — where things live

- **Search config** (`keywords`, `acceptable_locations`, `anti_keywords`,

  `max_jobs_saved`, `max_jobs_searched_per_keyword`, `max_experience_years`):

  owned by the `useJobConfig` hook (`src/hooks/useJobConfig.js`), persisted to

  `localStorage` under the key `job_scraper_config`. `App.jsx` holds

  `[config, setConfig]` from this hook and passes both down to `ConfigForm`.

- **`discarded_urls`**: owned by the `useDiscardedUrls` hook

  (`src/hooks/useDiscardedUrls.js`), persisted to `localStorage` under the

  separate key `job_scraper_discarded_urls` — intentionally decoupled from

  the search config so it survives independently. `App.jsx` holds

  `[discardedUrls, setDiscardedUrls]`.

- **Jobs results, loading, error, selected job (for the detail modal), toast

  message**: plain `useState` in `App.jsx`. Not persisted — a page reload is

  expected to clear results and re-fetch on demand.

- The two localStorage-backed hooks follow the same shape

  (`loadFromStorage`/`saveToStorage` helpers in `src/utils/localStorage.js`),

  so a new persisted field should follow the same pattern: a small hook that

  wraps `useState` + a `useEffect` that calls `saveToStorage`.

### The discard-and-refetch flow (important, non-obvious)

`App.jsx`'s `handleDiscard(job)`:

1. Computes `updatedDiscardedUrls` synchronously (does **not** rely on

   reading `discardedUrls` state right after calling its setter, since React

   state updates aren't synchronous).

2. Calls `setDiscardedUrls(updatedDiscardedUrls)` to persist it.

3. If the discarded job is the one currently open in `JobDetail`, closes the

   modal.

4. Shows a toast via `showToast(...)`.

5. Calls the shared `runSearch(discardedUrlsForRequest)` helper — the same

   function `handleSearch` uses — passing `updatedDiscardedUrls` explicitly

   (not the possibly-stale `discardedUrls` from closure) so the refetch

   definitely includes the just-discarded URL.

If you add another mutation that needs an immediate refetch with fresh data,

follow this same pattern: compute the new value locally first, pass it

explicitly into `runSearch`, and only then update state — don't chain off of

state you just set.

### Key components

- `ConfigForm.jsx` — collapsible panel, controlled via `config`/`onChange`

  props from `App.jsx`. Contains the "Search" button (`onSearch` prop).

- `ChipInput.jsx` — generic tag/chip input reused for `keywords`,

  `acceptable_locations`, and `anti_keywords`. Enter or `,` commits a chip;

  Backspace on an empty draft removes the last chip.

- `JobsTable.jsx` — renders a real `<table>` at `sm:` and up, and stacked

  cards below that breakpoint (both are rendered in the DOM, toggled via

  Tailwind's `hidden`/`sm:hidden`, not JS-based breakpoint detection).

- `JobDetail.jsx` — modal, closes on backdrop click or the X button. Renders

  `Job Description` via `dangerouslySetInnerHTML` — this is intentional and

  safe only because the HTML comes from our own trusted API response, not

  user input. Do not reuse this pattern for any user-supplied string.

- `Toast.jsx` — dumb presentational component; `App.jsx` owns the

  auto-dismiss timer (`setTimeout`, 3s).

### Known npm audit warning

`xlsx` (SheetJS) has open advisories about parsing untrusted spreadsheet

files. This app only *writes* `.xlsx` files client-side via

`XLSX.utils.json_to_sheet` / `XLSX.writeFile` — it never parses one — so the

advisories don't apply to how it's used here. Don't swap this package or add

a workaround for it without reason.

