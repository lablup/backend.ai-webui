# P3-D — BAITable seam closed: every table on `BAITableAstryx`, antd engine retired

**Target:** to-astryx (branched from `cf853bbf9`)
**Follows:** ticket 25 (built `BAITableAstryx`, migrated 3 `*Nodes`), ticket 30 §7
(deferred the flip behind two structural blockers)
**Status:** done

Ticket 30 §7 declined the flip because it was "13 files of churn that does not
lead to deleting the legacy engine", blocked by three things:

1. `BAITableProps` was baked into ~30 components' **public** prop interfaces.
2. `BAITableAstryx` imported `isColumnVisible` **from** `BAITable.tsx`, and the
   shared types (`BAIColumnsType`, `BAITableSettings`, …) lived there too.
3. `BAITableColumnCSVExportModal` — reachable from the new bottom bar — was
   still antd, so even a complete flip left an antd reach.

All three are removed here, so the legacy engine is actually deleted.

---

## What shipped

| File | Change |
|---|---|
| `packages/backend.ai-ui/src/components/Table/tableTypes.ts` | **new** — engine-neutral column model + persisted-override shape + `isColumnVisible` and friends. Imports no table implementation and no antd. |
| `.../Table/BAITableColumnCSVExportModal.tsx` | **rewritten** on Astryx `Dialog` + `Layout` (was antd `Modal` + `Form` + `Table` + `Checkbox`) |
| `.../Table/BAITableAstryx.tsx` | types re-homed; record constraint widened; `showHeader`, `pagination.showSizeChanger`, `pagination.hideOnSinglePage`, client-side sorting, `column.defaultSortOrder`, row-key fallback, header truncation |
| `.../Table/BAITableAstryx.css` | **new** — one rule (`showHeader={false}`) |
| `.../Table/index.ts` | barrel: only `BAITableAstryx`; `BAITableProps` is now an alias of `BAIAstryxTableProps` |
| `.../Table/BAITable.tsx`, `BAITable.css`, `BAITable.stories.tsx`, `BAITableSettingModal.tsx`, `BAITableSettingModal.stories.tsx` | **deleted** |
| `packages/backend.ai-ui/src/helper/index.ts` | `transformSorterToOrderString` deleted (see below) |
| `react/src/fix_antd.css` | dead `ant-table-wrapper` rule deleted |
| `packages/backend.ai-ui/package.json` | `react-resizable` + `@types/react-resizable` dropped |
| 82 consumer files | `BAITable` → `BAITableAstryx` (one-line import swap, as the ticket-25 seam promised) |

### Naming

Consumers now say `BAITableAstryx`; the **type** keeps the name
`BAITableProps` because ~30 components embed it in their own public prop
interfaces (`interface XProps extends BAITableProps<Row>`). Renaming the type
too would have rippled into their consumers for no behavioural gain — and
ticket 35 can rename `BAITableAstryx` → `BAITable` in one mechanical pass now
that only one engine exists.

---

## Flip census

- **82 files** touched by the identifier swap; **71** of them render
  `<BAITableAstryx …>` directly, the rest only reference the types.
- **Exception list: empty.** Every consumer flipped.
- The raw antd `Table` island in `BulkCreateUserFromCSVModal` (the ticket-21
  CSV preview grid + the failed-rows grid) also crossed — the columns needed
  no edits, because the Astryx engine accepts the same antd-shaped column
  model (`render` / `onCell` / `width` / `dataIndex`).

### Adapted features (per ticket 25's matrix)

| Feature | Sites | What happened |
|---|---|---|
| `showSorterTooltip={false}` | 17 | deleted (inert — Astryx has no sorter tooltip) |
| `scroll={{ x: 'max-content' }}` | 58 | deleted (inert — Astryx's scroll wrapper owns overflow; **verified live**: user list is a 2436px table inside a 1342px `overflow-x: auto` wrapper) |
| `scroll.y` | 2 | **DROPPED** as documented. `ErrorLogList` and `GeneratedKeypairListModal` lose the fixed-height body + sticky header and scroll with the page. |
| `pagination.style` | 6 | **DROPPED** as documented — all six were `marginRight: token.marginXS` on the antd pager; the bar is BUI-owned now. |
| `pagination.showSizeChanger: false` | 3 | **RE-ADDED** instead of dropped — Astryx renders the size selector exactly when `pageSizeOptions` is passed, so `false` simply withholds them. One line, and these are small fixed-page modals where the selector is noise. |
| `pagination.hideOnSinglePage` | 1 | **RE-ADDED** (`BAIBulkErrorModal`) — a 3-row failure list should not grow a pager. |
| `column.defaultSortOrder` | 5 | **RE-ADDED** for client-sorted tables (see PILOT-DECISION 2); ignored when `order` is controlled, matching antd's `sortOrder` precedence. |
| `column.sortDirections` | 1 | dropped (`AutoScalingRuleListNodes`) — the Astryx sort control cycles asc → desc → none unconditionally. |
| `expandable.expandRowByClick` | 1 | dropped (`ReservoirAuditLogList`, currently commented out of its page) — the chevron remains the affordance. |
| `rowSelection.{columnWidth,hideSelectAll,renderCell}` | 1 | see PILOT-DECISION 3 |
| `showHeader={false}` | 1 | **RE-ADDED** (ChatPage) — see PILOT-DECISION 1 |
| `rowClassName` | 1 | dropped (`BulkCreateUserFromCSVModal`) — its `bulk-csv-error-row` class had no rule anywhere in the repo; the invalid state is already carried by the validity icon column and the `onCell` error background. |
| `loading={{ indicator }}` | 1 | collapsed to a boolean (`ErrorLogList`) — the engine dims rows, no spinner slot. |
| antd `ColumnsType` / `ColumnType` / `TableProps` imports | 8 | → `BAIColumnsType` / `BAIColumnType` / `BAITableProps` |

---

## PILOT-DECISIONs

### 1. `showHeader={false}` is re-added, in CSS

Astryx's `Table` has no such prop (its header owns the sort controls and the
select-all checkbox), and ticket 25 listed it DROPPED with "needs a
header-less variant later". Later is now: ChatPage's history drawer is a
single-column list where a header row would be pure noise. Implemented as one
rule in `BAITableAstryx.css` collapsing `thead` under a wrapper class — the
selector touches the plain `thead` **element**, never a design-system class,
so an Astryx bump cannot silently break it. Verified live:
`thead { display: none }` with the wrapper class present.

### 2. Client-side sorting is implemented (this is the one real behaviour gap)

Ticket 25's engine treats `sorter` as a pure *signal*: it renders a sort
control and reports the new `-field` string through `onChangeOrder`. That is
correct for the server-paginated tables it migrated. But **9 call sites** —
`InviteFolderSettingModal`, `ProjectResourcePolicyList`,
`UserResourcePolicyList`, `GeneratedKeypairListModal`, `VFolderTable`,
`ResourcePresetList`, `KeypairResourcePolicyList`, `CustomizedImageList`,
`BAIFileExplorer` — pass comparator functions and wire **no** `order` /
`onChangeOrder` at all. On the antd engine those sorted client-side; flipping
them unchanged would have left clickable sort controls that do nothing, in
nine places, silently.

So the engine now distinguishes the two modes: `onChangeOrder` (or a
controlled `order`) means server-sorted and nothing changes; otherwise the
sort state is internal and `rows` is sorted with the column's own comparator,
seeded from `defaultSortOrder`. Verified live on `/admin/resource-policy`:
clicking a header twice reverses the row order.

### 3. `SessionTemplateModal`'s invisible-checkbox hack

It declared `rowSelection` with `columnWidth: 0`, `hideSelectAll: true` and
`renderCell: () => null` — an invisible checkbox column with **no `onChange`**
— purely to borrow antd's selected-row background for pinned rows (the
deleted `BAITable.css` had a `bai-table-zero-selection-column` rule
specifically for it). Astryx owns its checkbox column and has no equivalent
hook, so `rowSelection` is dropped and the highlight is applied directly via
`onRow` — which is what the hack was emulating.

### 4. `VFolderTable`'s selection-column click handler

Its `onRow` existed only to re-implement "clicking the padding of antd's
selection column toggles the row", by sniffing that column's antd class name.
The class does not exist on the Astryx engine and the Astryx checkbox column
handles its own clicks, so the handler is dropped rather than re-pointed at a
design-system internal.

### 5. Row identity falls back instead of resolving to `"undefined"`

`rowKey` defaults to `'id'` here; antd's `Table` defaulted to `'key'`, and 10
call sites relied on that default rather than declaring one. Left alone, every
row on those tables resolved to the string `"undefined"` — collapsing React's
reconciliation keys, selection and expansion onto a single identity.
**This was observed live**: `ErrorLogList` logged "Encountered two children
with the same key" for its 200+ rows. `getRowKey` now falls back
`rowKey` → `key` → `id` → row position, and the warning is gone.

### 6. Header text is clipped, not overflowed

Astryx puts a plain-string `header` straight into a `<th>` that is
`overflow: visible`, so a label longer than its column ran over the *next*
header — visible on the user list (`Sudo Session Enabled` in a 120px column
overlapping `Allowed Client IPs`). The adapter now wraps header content in a
truncating block, restoring Astryx's own documented "header cells always
truncate" behaviour without reaching into any design-system class.

### 7. `transformSorterToOrderString` deleted

It adapted the `sorter` argument of antd `Table.onChange` into the Backend.AI
order string; the antd `BAITable` was its **only** caller (after this ticket
its only reference was its own unit test). Its `SorterResult` parameter was
the sole antd import in `packages/backend.ai-ui/src/helper/index.ts`, which
the import-graph gate ranks as a **606-file taint hub** — so removing dead
code here makes that whole module antd-free.

### 8. Not re-added

`pagination.showTotal` / `hideOnSinglePage` beyond the one site,
`rowSelection.type='radio'`, `expandable.expandIcon`, column `filters` /
`filterDropdown` / `onFilter`, `summary`, `components`, table-level `sticky`,
`rowClassName`, `footer`, table `title` — all still zero (or one dropped) call
sites. **Virtualization stays DEFERRED** (product decision, 2026-08-07).

---

## Live proof

Vite on `127.0.0.1:5840` against `10.82.0.130:8090`, Playwright, admin login,
light + dark. Screenshots: `.scratch/astryx-migration/shots/p3-d/` (50 files).

| Surface | Observed |
|---|---|
| Session list | 10 columns, 2 sort controls; header sort writes `?order=name` to the URL |
| Column settings modal | opens, search filters the list, required column locked, drag handles present |
| **Column visibility persistence** | hid `Domain` → 21 → 20 columns; **still 20 after reload** |
| **Column resize persistence** | dragged col 2 from **120px → 180px**; **still 180px after reload** |
| **CSV export** | new Astryx dialog: search + per-column checkboxes with unsupported fields disabled; Export produced `users_export_2026-08-08T16-52-28.csv` |
| Row selection | user list checkboxes tick, header shows "1 selected", row highlights |
| Pagination | "1 - 10 of 10 items" + page-size selector + prev/next |
| VFolder list | 7 rows, 4 sort controls, 7 selection checkboxes |
| Agents / Deployments / Scheduler / Environments | render (20 rows / 12 cols / 4 sort controls on Environments) |
| Error logs | 228 rows, no duplicate-key warnings (see PILOT-DECISION 5) |
| Client-side sorting | `/admin/resource-policy` header click reverses row order |
| ChatPage headerless table | `thead` computed `display: none`, wrapper class present |
| Horizontal overflow | user list: 2436px table in a 1342px `overflow-x: auto` wrapper |
| Console | 0 page errors; 1 pre-existing unrelated warning (`titleStyle` on a DOM element, from `ConfigurableResourceCard`) |

Expandable rows were exercised by ticket 25 (`BAISchedulingHistoryNodes` +
`BAISubStepNodes`, unchanged here). The only other `expandable` consumer,
`ReservoirAuditLogList`, is commented out of `ReservoirPage`, so it has no
reachable surface to click.

---

## Gate deltas

| Gate | Before (`to-astryx`) | After |
|---|---|---|
| `ant-selector-gate` total | 910 | **905** |
| `ant-selector-gate` — table selectors in source | 4 (`BAITable.css`) + 1 (`fix_antd.css`) | **0** |
| `antd-import-graph` — direct antd | 300 | **291** |
| `antd-import-graph` — antd-free | 258 (26.1%) | **259 (26.3%)** |
| BUI bundle (`dist/backend.ai-ui.js`) | 2024 kB | **1960 kB** (−64 kB) |
| BUI runtime deps | includes `react-resizable` | dropped |

`astryx-token-gate` exits 0 (the new CSS declares no `var()`).

## Verification

- `bash scripts/verify.sh` → `=== ALL PASS ===`
- `pnpm --filter backend.ai-ui test` → 449 passed / 1 skipped
- `react`: `pnpm run test` → 62 files / 1164 tests passed
- `pnpm --filter backend.ai-ui build` → clean
