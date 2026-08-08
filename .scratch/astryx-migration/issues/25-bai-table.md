# 25 — BAITable 완전체 + *Nodes 리플

**Target:** to-astryx
**Blocked by:** 09, 10
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 파일럿 BAITableAstryx를 BUI의 정식 BAITable로 승격: 5-플러그인 조합 + 다층 헤더·expandedRowRender 대체·설정 모달·columnOverrides(width 포함) 영속화. 가상화는 유예(확정 결정). *Nodes 소비자들을 새 계약으로 이행.

## Acceptance criteria

- [x] 기존 BAITable 사용처의 기능 매트릭스 대비 커버/드롭 표 — 아래 "Feature matrix"
- [x] 대표 *Nodes 3종 이행 + 스크린샷 — `BAIUserNodes`, `BAISchedulingHistoryNodes`,
      `BAISubStepNodes`; light/dark 8장 `.scratch/astryx-migration/shots/25/`
- [x] verify.sh ALL PASS

---

## Implementation notes

### What shipped

| File | Role |
|---|---|
| `packages/backend.ai-ui/src/components/Table/BAITableAstryx.tsx` | the Astryx-native table (successor engine) |
| `packages/backend.ai-ui/src/components/Table/BAITableAstryxSettingModal.tsx` | Astryx-native column-settings modal (search / checkbox / dnd reorder) |
| `packages/backend.ai-ui/src/components/Table/index.ts` | the migration seam (`BAITable` / `BAITableLegacy` / `BAITableAstryx`) |
| `packages/backend.ai-ui/src/components/Table/BAITable.tsx` | `BAITableColumnOverrideItem.width` added (shared persistence shape) |
| `packages/backend.ai-ui/src/components/BAIUserNodes.tsx` | migrated |
| `packages/backend.ai-ui/src/components/fragments/BAISchedulingHistoryNodes.tsx` | migrated (expandable host) |
| `packages/backend.ai-ui/src/components/fragments/BAISubStepNodes.tsx` | migrated (nested table inside the expanded row) |
| `packages/backend.ai-ui/src/locale/*.json` (21) | `comp:BAITable.{Apply,Cancel,ExpandRow,Pagination}` in every language |
| `react/src/diagnostics/TableAstryxProbe.tsx` | probe orchestrator (Relay tags must live under `react/src`) |
| `react/theme-probe/table25.{tsx,html}`, `table25-env.ts`, `shoot25.mjs` | visual gate harness (ports 5715–5724) |

### The migration seam (the load-bearing decision)

**The new table keeps the antd/BUI-shaped public contract.** `columns` is still
`BAIColumnsType` (`title` / `dataIndex` / `render(value, record, index)` /
`sorter` / `fixed` / `required` / `defaultHidden` / `exportKey` / `onCell`), and
`dataSource` / `rowKey` / `rowSelection` / `pagination` / `expandable` /
`order` / `onChangeOrder` / `tableSettings` / `exportSettings` all keep their
antd names. The adapter to Astryx's `TableColumn` + plugin pipeline lives
INSIDE `BAITableAstryx`.

The pilot (`spike/astryx-pilot`) went the other way — it exposed Astryx's own
column shape (`header` / `renderCell` / `isRequired` / `width: pixel()`), which
would have forced every one of the 74 call sites to rewrite its column array.
**PILOT-DECISION: reverse that.** The measured call-site inventory (below) shows
the contract is used through 31 `{...tableProps}` pass-through wrappers; a
contract change ripples into ~35 parent pages as well. Keeping the antd shape
turns each migration into a one-line import swap:

```diff
- import { BAITable, BAITableProps } from '../Table';
+ import { BAITableAstryx, BAIAstryxTableProps } from '../Table';
```

Three names are exported side by side while the fleet moves:

| Export | Engine | Meaning |
|---|---|---|
| `BAITable` | antd | unchanged; the ~71 not-yet-migrated call sites keep compiling |
| `BAITableLegacy` | antd | same component, under the name later waves rename stragglers to |
| `BAITableAstryx` | Astryx | the successor — migrated call sites point here |

**Flip plan for later waves.** (1) Per page-group, swap `BAITable` →
`BAITableAstryx` and delete the now-inert `scroll={{ x: 'max-content' }}` /
`showSorterTooltip={false}` props. (2) When the last consumer is across, ticket
30/35 renames `BAITableAstryx` → `BAITable`, drops `BAITableLegacy`, and deletes
`BAITable.tsx` + `BAITableSettingModal.tsx` + `react-resizable` /
`antd` from BUI's dependency set. Nothing outside
`packages/backend.ai-ui/src/components/Table/` imports `isColumnVisible`,
`getVisibleColumns`, `restoreColumnToDefault` or `restoreAllColumnsToDefault`,
so those four helpers can be dropped freely at that point.

### The plugin composition

Astryx's `Table` is a primitive plus a transform pipeline. Six named plugins
are installed (five first-party + one local); Astryx's canonical order is
`columnSettings → sort → tree → selection → pagination`, unknown names last:

| Plugin | Source | Covers |
|---|---|---|
| `columnSettings` | `useTableColumnSettings` | visibility + display order from `columnOverrides` |
| `sort` | `useTableSortable` | header sort controls ⟷ the `-field` order string |
| `selection` | `useTableSelection` | checkbox column ⟷ antd `rowSelection` |
| `resize` | `useTableColumnResize` | drag-to-resize, widths persisted into `columnOverrides[key].width` |
| `sticky` | `useTableStickyColumns` | column-level `fixed: 'left' \| 'right' \| true` |
| `expansion` | **local** | antd `expandedRowRender` (no Astryx counterpart) |
| `cellRow` | **local** | antd `onCell` / `onRow` escape hatches |

**Pagination is deliberately not `useTablePagination`.** BUI's tables are
server-paginated (the data arrives already sliced) and BUI renders its own
bottom bar next to the settings gear. The plugin also hides itself when there
is a single page, which antd never does — the pilot measured that regression.

### PILOT-DECISIONs

1. **Column contract stays antd-shaped** (see seam above). Reverses the pilot.
2. **`expandedRowRender`** has no Astryx counterpart: `useTableRowExpansion` /
   `useTableTreeData` only do *inherited-column* child rows, and a plugin
   cannot insert a sibling `<tr>`. Rebuilt as a local plugin — a synthetic
   detail row is interleaved into `data` and `transformBodyRow` replaces that
   row's cells with a single `colSpan` `<td>`. Verified end-to-end with the
   real nested `BAISubStepNodes` table (`?case=scheduling`).
3. **Multi-level headers (`columns[].children`)** — Astryx's data-driven table
   has one header row and no `colSpan` contract. Column groups are flattened
   and each child header renders the group title above it in muted
   `Text type="supporting"`; deeper nesting concatenates with ` / `. The
   information survives, the spanning cell does not. **Measured: zero call
   sites in this repo use column groups**, so this is insurance, not parity
   debt (`?case=groups` is a synthetic demo).
4. **`loading`** — antd dims the rows under a centred spinner. Astryx has no
   table loading state; the dim + `pointer-events: none` wrapper is reproduced,
   **the spinner is dropped**. `spinnerLoading` becomes an alias of `loading`.
5. **`scroll`** is accepted and ignored: Astryx's own
   `astryx-table-scroll-wrapper` already handles horizontal overflow, which is
   what all 60 `scroll={{ x: 'max-content' }}` sites wanted. **`scroll.y`
   (sticky-header body scrolling) is DROPPED** — 2 call sites
   (`GeneratedKeypairListModal`, `ErrorLogList`) lose a fixed body height and
   scroll with the page instead.
6. **`sticky` (column `fixed`)** — antd pins per column; Astryx pins a
   contiguous *run* from each edge. The adapter derives the run from the
   leading `fixed: 'left' | true` columns and the trailing `fixed: 'right'`
   ones, and folds the synthetic selection / expand columns into the start run.
   A `fixed` column in the middle of the table would silently stop pinning —
   no call site does that today.
7. **Column widths** now persist. `BAITableColumnOverrideItem` gained
   `width?: number`; when a table wires `tableSettings`, a resize writes
   through `onColumnOverridesChange` and therefore survives a reload exactly
   like a visibility toggle. Without `tableSettings` widths stay in component
   state (the legacy behaviour). The rebuilt settings modal preserves `width`
   when it writes visibility/order back, so saving settings never resets a
   resize.
8. **Settings modal rebuilt, not ported.** The antd version renders a whole
   antd `Table` inside an antd `Modal` with a `Form` instance. The Astryx one
   is a `Dialog` + `Layout` with a plain row list: search `TextInput`, per-row
   `CheckboxInput`, dnd-kit drag handle, Cancel/Apply. Same
   `onRequestClose(result?)` contract, so the projection back into
   `columnOverrides` is unchanged. Drag is disabled while a search filter is
   active (reordering a filtered subset has no well-defined meaning).
9. **Virtualization is DEFERRED** (product decision, 2026-08-07). Not built.
   Re-open the decision before adding it.
10. **The CSV export modal is still antd** (`BAITableColumnCSVExportModal`).
    It is reachable from the new bottom bar but its internals are out of this
    ticket's scope; it is on the ticket-30 list together with the legacy
    settings modal.

### Feature matrix — existing BAITable usage vs the Astryx engine

Usage counts are from a full call-site inventory (74 production `<BAITable`
sites; "indirect" = supplied by a parent page through a `{...tableProps}`
wrapper).

| Feature | Sites | Status | Note |
|---|---|---|---|
| `columns` / `dataSource` / `rowKey` | 74 | **covered** | same antd-shaped contract |
| column `title` / `dataIndex` / `render` / `key` / `align` / `width` | 74 | **covered** | `render(value, record, index)` gets the real row index |
| column `sorter` + `order` / `onChangeOrder` | 35 | **covered** | `sortKey` = `dataIndex` (matches `transformSorterToOrderString`) |
| `scroll={{ x: 'max-content' }}` | 60 | **covered (no-op)** | Astryx scroll wrapper handles it; delete the prop when migrating |
| `scroll.y` | 2 | **DROPPED** | no sticky-header body scroll |
| column `fixed: 'left' \| 'right' \| true` | 40 | **covered** | via `useTableStickyColumns`, contiguous runs only |
| `resizable` | 23 | **covered** | `useTableColumnResize`; widths now persistable |
| `size="small"` | 32 | **covered** | → Astryx `density: 'compact'` |
| `pagination` object (server-side) | 22 + 32 indirect | **covered** | custom bottom bar; `pageSizeOptions`, `extraContent`, `total`, `current`, `pageSize`, `onChange` |
| `pagination={false}` | 16 | **covered** | bottom bar suppressed |
| `pagination.showSizeChanger` | 5 | **covered (always on)** | the size selector is always rendered |
| `pagination.style` | 7 | **DROPPED** | the bar is BUI-owned; use `extraContent` |
| `pagination.hideOnSinglePage` / `showTotal` | 1 each | **DROPPED** | the range text is fixed (`BAIPaginationInfoText`) |
| `rowSelection` (`type`, `selectedRowKeys`, `onChange`, `preserveSelectedRowKeys`) | 13 + 10 indirect | **covered** | |
| `rowSelection.getCheckboxProps` | 0 | **covered** | `disabled` only |
| `rowSelection.renderCell` / `hideSelectAll` / `columnWidth` | 1 each | **DROPPED** | Astryx owns the checkbox column |
| `rowSelection.type='radio'` | 0 | **DROPPED** | |
| `tableSettings` (`columnOverrides`, `defaultColumnOverrides`, `onColumnOverridesChange`, `disableColumnReorder`) | 9 + 29 indirect | **covered** | plus new `width` persistence |
| `exportSettings` | 3 + 4 indirect | **covered** | trigger moved from a kebab `Dropdown` to a direct icon button |
| column `defaultHidden` / `required` / `exportKey` | 15 / ~20 / 5 | **covered** | |
| `expandable` (`expandedRowRender`, `rowExpandable`, `expandedRowKeys`, `onExpandedRowsChange`, `columnTitle`, `columnWidth`) | 1 + 3 indirect | **covered** | local `expansion` plugin |
| `expandable.expandIcon` | 0 | **DROPPED** | chevron `IconButton` is fixed |
| `onRow` | 6 + 1 indirect | **covered** | local `cellRow` plugin |
| column `onCell` | ~9 | **covered** | local `cellRow` plugin |
| `loading` | 24 | **partial** | dim only, no spinner |
| `spinnerLoading` | 1 | **partial** | alias of `loading` |
| `bordered` | 7 | **covered** | → `dividers="grid"` |
| `locale.emptyText` | 5 | **covered** | → Astryx `emptyState` |
| `showSorterTooltip={false}` | 17 | **covered (no-op)** | Astryx has no sorter tooltip |
| column groups (`children`) | **0** | **covered (flattened)** | see PILOT-DECISION 3 |
| `showHeader={false}` | 1 | **DROPPED** | `ChatPage` — needs a header-less variant later |
| column `defaultSortOrder` | 5 | **DROPPED** | pass an initial `order` string instead |
| column `ellipsis` | 2 | **covered (global)** | `textOverflow="truncate"` is the default |
| column `filters` / `filterDropdown` / `onFilter` | **0** | not built | all filtering goes through `BAIPropertyFilter` (server-side) |
| `summary` | **0** | not built | |
| `virtual` | **0** | **DEFERRED** | explicit product decision |
| `components` (body/header override) | **0** | not built | the pipeline replaces the use case |
| `sticky` (table-level) / `rowClassName` / `footer` / table `title` | **0** | not built | |
| `getVisibleColumns` / `restoreColumnToDefault` / `restoreAllColumnsToDefault` | **0 external** | dead API | safe to delete in ticket 30 |

### Migrated consumers

| Component | Exercises | Consumers touched |
|---|---|---|
| `BAIUserNodes` | sorting, resize, selection, column settings, CSV export, pagination, `fixed: true`, `required`, `exportKey`, `minWidth` | none — no app call site (stories only) |
| `BAISchedulingHistoryNodes` | controlled `expandable` (`expandedRowKeys` + `columnTitle` kebab), `tableSettings`, `order`, pagination | `BAISchedulingHistoryTable` (BUI, unchanged) → `SessionSchedulingHistoryModal` (react, unchanged) |
| `BAISubStepNodes` | nested table inside an expanded row, `onCell` cell styles, `fixed: 'left'`, `pagination={false}` | `BAISchedulingHistoryTable`, `BAIRouteSchedulingHistoryTable`, `BAIDeploymentSchedulingHistoryTable` (all unchanged) |

Zero files under `react/src/components` or `react/src/pages` needed edits —
the seam absorbed the change. (`react/src/diagnostics/TableAstryxProbe.tsx` is
new probe-only code, not an app surface.)

### Screenshots

`.scratch/astryx-migration/shots/25/` — `after-{users,scheduling,groups,settings}-{light,dark}.png`.

Reproduce:

```bash
cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5715 --strictPort
node theme-probe/shoot25.mjs ../.scratch/astryx-migration/shots/25 users,scheduling,groups after 5715
```

### Known risks / follow-ups

- **BUI bundles its own copy of `@astryxdesign/core`** (it is a devDependency,
  not a peer, so rollup inlines it). Class-based styling still resolves against
  the app's `astryx.css`, and the screenshots confirm the table renders
  correctly — but any Astryx *React context* is duplicated across the boundary.
  Ticket 30 (BUI contract) owns moving it to `peerDependencies`.
- `SELECTION_COLUMN_KEY` (`'__xds_selection'`) is mirrored from Astryx's
  internals because the package does not export it; only used to keep the
  checkbox inside the pinned start run. Re-check on an Astryx bump.
- `useTableColumnResize` treats a `proportional()` column by resizing its
  NEIGHBOUR (to keep the table full-width), which feels different from antd's
  `react-resizable` (which grows the table and lets it scroll). Columns with an
  explicit numeric `width` resize freely.
- The antd `.ant-*` selector gate still reports 3 hits in the legacy
  `BAITable.tsx`; they disappear with the file in ticket 30.
