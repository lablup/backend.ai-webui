# Spec — On-demand weekly/monthly resource usage report with PDF/image export

Wayfinder map: FR-3620. All decisions below were resolved on the map's tickets
(FR-3621–FR-3626, FR-3630); this document assembles them for implementation.
Intended to seed an ultracode multi-agent build — see "Work-item decomposition".

## 1. Overview

A user picks a calendar period (week or month) and gets a self-contained
**usage report document** they can preview and export as **PDF, PNG, and CSV**.

Two audiences:

- **Admin (superadmin), whole-cluster scope** — cluster-wide usage plus a
  top-users table.
- **End user, own usage** — the user's own consumption.

Generation is **on-demand only**. Periods are **calendar-based** (selected
ISO week / calendar month).

## 2. Out of scope (v1)

- Scheduled/periodic generation and email delivery.
- Domain-scoped admin reports — blocked on manager support (needs-backend
  follow-up **FR-3628**: no `domain` label on the utilization gauge).
- A new admin statistics page (admin entry is a dashboard trigger).

## 3. Entry points and flow (FR-3625)

- **Report view**: a dedicated print-friendly route rendering the document.
  Scope and period are URL parameters. Suggested route: `/report/usage`
  (top-level, not project-scoped; RouteAccessGuard by audience).
- **Triggers** (both audiences reach the same view):
  - Statistics page (`/project/:name/statistics`) — "Export report" action in
    the card `extra` slot → user-scope report.
  - User dashboard and `/admin/dashboard` — report action/card; the admin
    dashboard trigger opens admin-scope.
- **Flow**: preview-then-export. The view is the preview; period/scope are
  adjustable in place; export buttons live in the view's control bar (which is
  excluded from print/PNG output).

## 4. Report document (FR-3626 — prototype Variant B "Dense grid", FR-3630)

Layout (top to bottom):

1. **Header strip** — product branding (existing logo/name, respects
   BrandingPage), report title, period label, scope label; inline **KPI
   tiles**: GPU-hours, CPU-hours, sessions launched, avg GPU util, avg CPU
   util.
2. **Truncation banner** (conditional) — shown when utilization coverage is
   partial for the period (Prometheus retention; see §5). Copy states that
   allocation totals cover the full period.
3. **2-column grid of compact chart cards** (Recharts): utilization % (area,
   CPU/GPU/MEM), GPU-hours/day (bar), CPU-hours/day (bar), sessions/day (bar).
4. **Admin scope only**: top-users table (rank, user, GPU-hours, CPU-hours,
   sessions).
5. **Methodology footnote** — data sources, generated-at timestamp, cluster.

Rules:

- **Language follows the UI locale** (existing i18n, all languages; no
  language picker). All strings via i18n keys.
- **Empty sections are never omitted** — render a "No data for this period"
  placeholder so structure stays comparable across periods.
- Charts must render with fixed widths under print (pin
  `ResponsiveContainer` via print CSS).
- Prototype reference (throwaway, do not promote code as-is): branch
  `FR-3626`, `react/src/pages/UsageReportPrototypePage.tsx` + `.css`.

## 5. Data layer (FR-3621, FR-3623)

Utilization = Prometheus-backed (gauge `backendai_container_utilization`).
Allocation = DB-backed REST. Constraint: stock Prometheus retention is
**15 days** and is not discoverable via API — utilization is **best-effort**
within retention; **allocation is the primary source for headline totals**.

Per audience:

- **User self**:
  - Utilization series + range avg/max: GQL `user_utilization_metric`
    (manager ≥ 25.6.0), arbitrary `start`/`end`/`step`.
  - Allocation: `GET /resource/stats/user/month` (trailing-30d window,
    15-min bins; existing `user_stats()` client wrapper /
    `useUserUsageStats`). User monthly stays **best-effort permanently** —
    show available data + truncation banner; no backend ask.
- **Admin global (superadmin-gated)**:
  - Utilization: **not servable today** (implementation revision, 2026-08-24;
    the spec's original preset plan is withdrawn — the `prometheusQueryPreset*`
    APIs belong to the deployment domain and are not reused here). Prometheus
    utilization is exposed per user only (`user_utilization_metric`, required
    `user_id`); sections render a "requires manager support" placeholder until
    a sibling field with optional scope labels lands (`TODO(needs-backend)`
    FR-3645 — the manager's metric service is already scope-agnostic, only the
    GQL layer pins `user_id`).
  - Allocation: `GET /resource/stats/admin/month` bins (running sessions
    included) whenever the trailing-30d window covers the period; otherwise
    `GET /resource/usage/period` per-kernel records (terminated-only on older
    managers), which also feed the top-users table.
- **Headline totals (hybrid)**: utilization totals server-side (seeded
  instant presets; user side derives `avg_value × period-hours`); allocation
  totals summed client-side from the returned bins/records (no totals API).
- **Feature gating**: per audience via `baiClient.supports()` (user report ≥
  25.6.0; admin report ≥ 26.4.2 + superadmin role).

## 6. Export pipelines (FR-3624, FR-3630)

- **PDF (browser)**: print CSS (`@media print`, `@page A4`, `break-inside`,
  `break-before` for the top-users page) + the browser print dialog
  ("Save as PDF"). Vector output, zero new dependencies. Control bar and any
  app chrome hidden in print.
- **PDF (Electron)**: `webContents.printToPDF` IPC handler
  (`preferCSSPageSize: true`) reusing the same print CSS — silent save
  without a dialog. Wire through `electron-app/main.js` ipcMain + preload.
- **PNG**: new dependency **`html-to-image`** (exact-pinned; clears
  `minimumReleaseAge`) rasterizing the report DOM. `dom-to-image-more` is the
  designated substitute if Safari issues appear. jspdf raster PDF is a
  documented fallback only — do not add it in v1.
- **CSV**: client-side via existing `react/src/helper/csv-util.ts`
  (`downloadCSV`) — daily series, totals, and (admin) top-users.

## 7. Work-item decomposition (ultracode seed)

Ordered; items in the same tier can run in parallel.

- **W1 — Report view scaffold**: route `/report/usage` + Variant-B layout with
  typed mock data, URL params (scope, periodType, period), control bar,
  truncation banner + empty placeholders, i18n keys. (No data wiring.)
- **W2 — User-scope data wiring**: `user_utilization_metric` + `user_stats()`
  → view models; hybrid totals for user; version gating.
- **W3 — Admin-scope data wiring**: preset seeding module +
  `prometheusQueryPresetResult` + new client wrapper for
  `/resource/usage/period` + `/resource/stats/admin/month`; top-users
  aggregation; superadmin gating. (Parallel with W2 after W1.)
- **W4 — PDF export**: print CSS hardening (chart width pinning, page
  breaks) + Electron printToPDF IPC. (After W1; parallel with W2/W3.)
- **W5 — PNG + CSV export**: add `html-to-image`; CSV via csv-util. (After
  W1; parallel.)
- **W6 — Entry-point triggers**: Statistics card `extra` action, user
  dashboard + admin dashboard items, feature-gated visibility. (After W1.)
- **W7 — Polish & verification**: `make i18n` for all locales, e2e specs
  (report renders per scope/period, export buttons, truncation/empty states),
  docs update (docs-lead flow), `scripts/verify.sh`.

Each work item lands as a stacked PR (`gh stack`), titles
`feat(FR-XXXX): …` per repo convention; implementation issues to be cloned
from Jira as usual.

## 8. Acceptance criteria

- Admin (superadmin) can open the report from `/admin/dashboard`, pick any
  calendar week/month, and export PDF (vector, selectable text incl. CJK),
  PNG, and CSV of cluster-wide usage with a top-users table.
- A user can do the same for their own usage from Statistics / dashboard.
- Monthly reports beyond utilization retention show full allocation totals,
  partial utilization charts, and the truncation banner; fully empty sections
  show the placeholder.
- Report language matches the UI locale; branding matches BrandingPage.
- No new dependency other than `html-to-image`; `scripts/verify.sh` passes;
  works in an air-gapped deployment (no external fetches).

## 9. References

- Map: FR-3620 (decision index; each ticket holds its resolution detail).
- Needs-backend follow-up: FR-3628 (domain scope).
- Prototype: branch `FR-3626` (`/prototype/usage-report`, throwaway).
- Research notes: local branches `research/manager-usage-metrics`,
  `research/pdf-image-export-techniques` (`.scratch/research/…`).
