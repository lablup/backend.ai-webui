# Research: legacy `ComputeSession` data surface for the session grid

Wayfinder research ticket: #8787 (map: #8786 — session-list "resource grid" view
prototype fed by the legacy `ComputeSession` GraphQL type).

All facts below are read from primary sources in this repo (schema + consuming
code), with `file:line` references against the commit this doc is committed on.

---

## 1. `occupied_slots` — JSON shape

**Schema.** `occupied_slots: JSONString` exists on three levels:

- legacy `type ComputeSession` — `data/schema.graphql:3232` (plus siblings
  `occupying_slots` :3231 and `requested_slots` :3235, the latter added in
  24.03.0)
- `type ComputeContainer` (per kernel) — `data/schema.graphql:3078`
- `ComputeSessionNode` (new graph) — `data/schema.graphql:3331`

**Shape.** A flat string→string map. Keys are resource-slot names; values are
**decimal strings** (never numbers). Example, confirmed against the parsing
code below:

```json
{
  "cpu": "4",
  "mem": "34359738368",
  "cuda.shares": "0.5"
}
```

```json
{
  "cpu": "16",
  "mem": "68719476736",
  "cuda.device": "2"
}
```

**Key vocabulary.** The canonical slot-name list is
`react/src/hooks/backendai.tsx:23-44`:

- base: `cpu`, `mem`
- known accelerators (`<family>.<unit>` form): `cuda.device`, `cuda.shares`,
  `rocm.device`, `tpu.device`, `ipu.device`, `atom.device`,
  `atom-plus.device`, `atom-max.device`, `gaudi2.device`, `warboy.device`,
  `rngd.device`, `hyperaccel-lpu.device`, `tt-n300.device`

New families can appear at runtime; slot metadata (display name, unit,
`number_format.binary` / `round_length`) is resolved dynamically via
`useResourceSlotsDetails()` — do not hardcode beyond the base pair.

**Value semantics** (from consuming code, not guessed):

- `cpu` — core count as a string; `parseFloat`/`Math.floor(Number(...))`
  (`src/lib/backend.ai-client-node.ts:3412-3416`,
  `react/src/components/ComputeSessionNodeItems/SessionSlotCell.tsx:65`).
- `mem` — **bytes** as a plain numeric string; consumers feed it to
  `convertToBinaryUnit(mem, 'g')` (`SessionSlotCell.tsx:96`). The parser also
  accepts unit-suffixed strings like `"4g"`
  (`convertUnitValue`, `react/src/helper/index.tsx:115`).
- `cuda.shares` — **fractional** GPU (fGPU); `parseFloat`
  (`src/lib/backend.ai-client-node.ts:3454-3457`).
- `*.device` — integer device count; `Math.floor(Number(...))`
  (`src/lib/backend.ai-client-node.ts:3444-3447`).

**Gotchas.**

- While a session is `PENDING`, `occupied_slots` is `"{}"`. The session table
  falls back to `requested_slots` in that case
  (`SessionSlotCell.tsx:56-62`). A grid prototype should do the same.
- Allocated can be *less* than requested (round-down); see the comparison
  logic in `react/src/components/SessionDetailContent.tsx:280-345`.
- Unified-memory accelerators are quantity-less; detect via
  `getUnifiedSlotNameFromTag(session.tag)`
  (`react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx`,
  used at `SessionSlotCell.tsx:102`).

---

## 2. `live_stat` — key inventory and value shape

**The most important finding: the legacy `type ComputeSession` has NO
session-level `live_stat` field.** Check its field list at
`data/schema.graphql:3181-3240` — `live_stat` only exists per kernel, on
`ComputeContainer` (`data/schema.graphql:3079`, with `last_stat` at :3080).
The same is true on the new graph: the React app aggregates per-kernel
`live_stat` client-side (`react/src/hooks/useSessionNodeLiveStat.tsx:59-60`
carries the `TODO: replace this with session live_stat after implementation`).
So a session-grid prototype on legacy `ComputeSession` must fetch
`containers { live_stat }` and aggregate — exactly what the legacy client
already did (`src/lib/backend.ai-client-node.ts:3141`).

**Per-metric value shape** — every key maps to an object of **string** values
(`ResourceStatItem`, `react/src/hooks/useSessionNodeLiveStat.tsx:12-21`):

```json
{
  "cpu_util": {
    "current": "142.3",
    "capacity": "400",
    "pct": "35.57",
    "unit_hint": "percent",
    "stats.avg": "120.1",
    "stats.max": "310.0",
    "stats.rate": "1.2"
  },
  "mem": {
    "current": "2147483648",
    "capacity": "34359738368",
    "pct": "6.25",
    "unit_hint": "bytes"
  }
}
```

Note the aggregate variants are **literal dotted keys inside each metric
object** (`"stats.avg"`, `"stats.max"`, `"stats.rate"`) — not `_sum`/`_avg`
key-name suffixes at the top level. `SessionUsageMonitor` addresses them as
`` `stats.${displayTarget}` `` (`react/src/components/SessionUsageMonitor.tsx:74-77`).

**Kernel-level key inventory** (from `SessionLiveStats`,
`useSessionNodeLiveStat.tsx:23-35`, and the generic device handling in
`SessionUsageMonitor.tsx:141-205`):

| Key | Meaning | Notes |
|---|---|---|
| `cpu_util` | CPU utilization | `pct` is per-100%-per-core, so it ranges to `cpu × 100`; the UI caps it: `Math.min(pct, cpu*100)` then divides by core count (`SessionUsageMonitor.tsx:81-98`, `SessionSlotCell.tsx:65-69`) |
| `cpu_used` | cumulative CPU time | excluded from usage bars (`SessionUsageMonitor.tsx:142`) |
| `mem` | memory bytes | `current`/`capacity` in bytes |
| `io_read`, `io_write` | cumulative I/O bytes | displayed via `convertToDecimalUnit(current, 'm')` |
| `net_rx`, `net_tx` | network | present in the type inventory |
| `io_scratch_size` | scratch disk | |
| `<family>_util` | accelerator utilization | e.g. `cuda_util`; percent-shaped |
| `<family>_mem` | accelerator memory | e.g. `cuda_mem`; bytes-shaped, has `capacity` |

Device keys use `_`-joined family names: the consuming code maps a stat key
back to its slot name with `key.split('_').slice(0, -1).join('-')` and then
matches `<name>.<unit>` (`SessionUsageMonitor.tsx:144-148`,
`SessionSlotCell.tsx:126-127` uses `key.split('.')[0] + '_mem'` in the other
direction). So `hyperaccel_lpu_util` ↔ `hyperaccel-lpu.device`.

**Session-aggregated vs per-kernel.** Everything above is **per-kernel**.
Session-level numbers are produced client-side by
`useSessionLiveStat` (`useSessionNodeLiveStat.tsx:61-145`):

- **sum** `current` and `capacity` across kernels (Big.js precision),
- **average** `stats.max` / `stats.avg` / `stats.rate`,
- **recompute** `pct = current / capacity × 100`,
- take the first non-empty `unit_hint`.

That merge function only needs an array of parsed stat objects — it is
directly portable to legacy `containers[].live_stat` input.

**Do not copy the agent shape.** `AgentNode.live_stat` is a different,
two-level structure `{ node: {...}, devices: {...} }` with extra keys such as
`disk`, `net_rx`/`net_tx` (bps), `<family>_power`, `<family>_temperature`
(`packages/backend.ai-ui/src/components/fragments/BAIAgentTable.tsx:400-500`,
disk at :494). Kernel/session live_stat is flat.

---

## 3. `containers` — per-kernel data (`ComputeContainer`)

`ComputeSession.containers: [ComputeContainer]` (`data/schema.graphql:3237`);
the type is at `data/schema.graphql:3041-3082`. Everything a kernel-mode grid
cell needs is there:

| Concern | Fields |
|---|---|
| identity | `id`, `idx`, `kernel_id` (24.03.1+), `container_id`, `session_id` |
| cluster topology | `role`, `hostname`, `cluster_idx`, `local_rank`, `cluster_role` (`main`/`sub`), `cluster_hostname` (`main1`, `sub1`, …) |
| placement | `agent`, `agent_addr` (admin-only in practice) |
| lifecycle | `status`, `status_changed`, `status_info`, `status_data`, `created_at`, `terminated_at`, `starts_at`, `scheduled_at` |
| image | `image` (deprecated ≥24.03.0), `image_object: ImageNode`, `architecture`, `registry` |
| resources | `occupied_slots: JSONString`, `resource_opts: JSONString` |
| stats | **`live_stat: JSONString`**, `last_stat: JSONString` (terminated snapshot), `abusing_report: JSONString` |
| misc | `preopen_ports: [Int]` |

Precedent: the legacy client's default session-list field set already includes
`'containers {live_stat last_stat}'`
(`src/lib/backend.ai-client-node.ts:3131-3143`, mirrored in
`packages/backend.ai-client/src/resources/compute-session.ts:54-73`).

---

## 4. Reusable inventory

| What | Where | Reuse note |
|---|---|---|
| Kernel→session live_stat aggregation (sum/avg/pct, Big.js) | `react/src/hooks/useSessionNodeLiveStat.tsx:61-145` (`useSessionLiveStat`) | Relay-fragment-bound to `ComputeSessionNode.kernel_nodes`; the merge body is fragment-independent — extract or mirror it for `containers[].live_stat` |
| `ResourceStatItem` / `SessionLiveStats` types | `react/src/hooks/useSessionNodeLiveStat.tsx:12-35` | The de-facto live_stat schema |
| Session usage bars (util-first sort, CPU cap, per-device fallthrough) | `react/src/components/SessionUsageMonitor.tsx` | `displayMemoryUsage()` at :234-242 is exported |
| Per-slot table cell + usage badge (50/80% thresholds → warning/error) | `react/src/components/ComputeSessionNodeItems/SessionSlotCell.tsx` (`percentToSemantic` :159-166) | The grid cell is close to a restyling of this |
| Slot-name types + metadata | `react/src/hooks/backendai.tsx:23-44` (`ResourceSlotName`), `:56` (`useResourceSlots`), `:112` (`useResourceSlotsDetails` → `mergedResourceSlots` with `human_readable_name`, `display_unit`, `description`, `number_format.{binary,round_length}`) | The dynamic-slot answer; BUI reads the same via `BAIResourceSlotsProvider` context |
| Byte/unit formatting | `react/src/helper/index.tsx:115` (`convertUnitValue`), `:212` (`convertToBinaryUnit`), `:246` (`convertToDecimalUnit`), `:266` (`toFixedFloorWithoutTrailingZeros`); BUI mirror `packages/backend.ai-ui/src/helper/index.ts:90/189/223/243` | Accepts raw byte strings or `"4g"`-style values |
| Slot chip with icon/unit (+ `allocated / requested` compare) | `packages/backend.ai-ui/src/components/BAIResourceNumberWithIcon.tsx:47-66` | |
| Render a whole slot map | `react/src/pages/SessionLauncherPage.tsx:1734` (`ResourceNumbersOfSession`) | |
| Slot-JSON → numeric map, occupied-vs-requested diff | `react/src/components/SessionDetailContent.tsx:94` (`parseSlotsToNumbers`), `:280-345` | |
| Progress bar w/ label | `react/src/components/SimpleProgressWithLabel.tsx` | Used by both session + agent monitors |
| Polling control (user-adjustable interval) | `react/src/components/AutoUpdateFetchKeyButton.tsx` | Session list uses `defaultAutoUpdateDelay={15_000}` |
| Legacy `compute_session_list` callers | `src/lib/backend.ai-client-node.ts:3131-3234` (`list`, `listAll`), `packages/backend.ai-client/src/resources/compute-session.ts:54-130` | Working query strings incl. `containers {live_stat last_stat}` |
| Agent-side live_stat rendering (different shape) | `react/src/components/AgentNodeItems/AgentResources.tsx:61`, `packages/backend.ai-ui/src/components/fragments/BAIAgentTable.tsx:400-500` | Reference only — do not copy the `{node, devices}` shape |

---

## 5. Query cost — how the session list queries today

**The current page does not use `compute_session_list`.**
`react/src/pages/ComputeSessionListPage.tsx:214-295` runs one Relay
`useLazyLoadQuery` against **`compute_session_nodes`** (`ComputeSessionNode`
connection, GRAPHENE graph; schema `data/schema.graphql:14713`) with:

- pagination `first` + `offset` (page size default **10**, via
  `useBAIPaginationOptionStateOnSearchParam`; this legacy connection tolerates
  the mixed mode — per `.claude/rules/graphql-pagination.md`, do not copy it
  onto a `*V2` connection),
- a `filter` string (status category + type + property filter +
  `user_id == current user`), `order` (default `-created_at`),
- **five additional count-only sub-queries** (`first: 0`) for the per-tab
  badges (all/interactive/batch/inference/system).

Per-row fields come from `SessionNodesFragment`
(`react/src/components/SessionNodes.tsx:93-120`): name/status/type/
service_ports/agent_ids plus nested fragments — including
`SessionSlotCellFragment` (occupied_slots, requested_slots) and
`useSessionNodeLiveStatSessionFragment`, i.e. **the list already fetches
`kernel_nodes { live_stat, cluster_role }` for every visible row today**.

**Refresh pattern:** no Relay subscription/polling — a fetchKey bump from
`AutoUpdateFetchKeyButton` (default **15 s**, user-adjustable, persisted per
`settingId="session-list"`) re-runs the query with
`fetchPolicy: 'network-only'`; `useDeferredValue` on variables + fetchKey keeps
the previous table rendered while the refetch is in flight
(`ComputeSessionListPage.tsx:211-295, 526-538`).

**Note on ~100 sessions × `live_stat` + `containers` on an interval:**

- Legacy `compute_session_list` is strict `limit!`/`offset!`
  (`data/schema.graphql:14754`); one page of 100 is a single request. The
  legacy client's own guardrails: `list()` defaults to `limit=30`, `listAll()`
  pages by 100 and hard-caps at 1000 sessions
  (`src/lib/backend.ai-client-node.ts:3218-3219`), default request timeout 5 s.
- The dominant payload is `containers { live_stat }`: one JSON blob (~1–3 KB,
  more with many accelerator keys) **per kernel**, so a 100-session ×
  N-kernel page is a few hundred KB per poll — roughly 10× what today's
  10-row page moves. The manager serves `live_stat` from its stat cache
  (kernels' Redis-backed stats), so DB cost is modest; transfer + JSON.parse
  on the client is the real cost.
- Practical mitigations for the prototype: keep the 15 s default interval
  (reuse `AutoUpdateFetchKeyButton`); request the minimal field set (skip
  `last_stat` unless showing finished sessions, skip `abusing_report`,
  `idle_checks`, `dependencies`); filter to non-finished statuses
  (`live_stat` is only meaningful for RUNNING); and parse each row's
  JSON once per poll (memoize on the raw string, as
  `CellErrorBoundary resetKeys={[record?.live_stat]}` does in BAIAgentTable).
