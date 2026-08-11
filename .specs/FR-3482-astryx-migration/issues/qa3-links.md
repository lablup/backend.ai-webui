# QA3 — table name-cell links: uniform hover underline

User report: "all table name-cell links must behave like the session list's
session-name style (underline appears on hover). Some cells don't."

The reference is `SessionNodes.tsx` → `BAINameActionCell` →
`BAILink type="hover"` → `.bai-link-hover:hover { text-decoration: underline }`
(`packages/backend.ai-ui/src/components/BAILink.css`).

## Two root causes, both in shared components

### 1. `text-decoration` does not cross a block boundary

`text-decoration` propagates to in-flow **inline** descendants only. It stops
dead at a block-level box.

Astryx `Link` always wraps its children in a `Text`, and `Text` renders that
span as `display: block` whenever it truncates — which is every name cell,
because every name cell truncates. So the rule fired on the right element and
painted nothing:

```
button.bai-link-hover      text-decoration-line: none -> underline   (on hover)
  span.astryx-text (block) text-decoration-line: none -> none        <- paints the glyphs
```

Measured live on `/agent` before the fix (`shots/qa3/links-before-light.json`).
The anchor was underlined; the pixels never were.

`BAIFlex` made it worse in its own way: it hard-codes `textDecoration: 'none'`
as an **inline style**, so any `BAIFlex` laid out inside a link cancelled the
underline and no stylesheet could win it back (inline styles beat everything
short of `!important`). That is the allowed-storage-host cells on
`/admin/project` and `/resource-policy`.

### 2. `BAILink` rendered a class-less anchor when only `to` was passed

`type` defaulted to `undefined`, and the `to` branch only attached
`bai-link-hover` when `type` was explicitly `'hover'`. So ~10 call sites — the
Reservoir artifact name (`BAIArtifactTable.tsx:154`), `FolderLink.tsx:64`,
`BAIArtifactDescriptions.tsx:64`, `AdminModelCard.tsx:506` — rendered a bare
react-router `<a>`. Astryx's reset (`:where(a){color:inherit;
text-decoration:inherit}`) then flattened them into plain body text: no accent
colour, no hover underline, no visual cue that they were links at all.

## Fixes — all at the shared-component level

| File | Change |
|---|---|
| `packages/backend.ai-ui/src/components/BAILink.css` | `.bai-link-hover :where(span, div, p, b, strong, em, code) { text-decoration: inherit }` — descendants mirror the link's own state (`none` at rest, `underline` on hover), so the rule needs no `:hover` twin and can never drift. `:where()` keeps specificity at 0 so a call site can still opt out. |
| `packages/backend.ai-ui/src/components/BAILink.tsx` | `type` now defaults to `'hover'`; the `to` branch always attaches the class. A link that does not look like a link is a bug, so this is the baseline rather than opt-in. |
| `packages/backend.ai-ui/src/components/BAIFlex.tsx` | inline `textDecoration: 'none'` → `'inherit'`. Outside a decorated ancestor the two are identical (`text-decoration-line` is `none` by default), so the reset only ever *did* anything in the one case where it was wrong. |
| `react/src/components/astryx-bui/BAINameActionCellAstryx.tsx` | the vfolder-name `Link` gets `className="bai-link-hover"`, putting the app-side NAC fork on the same contract as BUI's `BAINameActionCell`. Astryx's own underline is gated behind `@media (hover: hover)` **and** dies at the block `Text`, so relying on it left folder names as the one name link with no hover feedback. |

**Zero per-cell fixes.** Every call site is unchanged; all four fixes are in
components the cells already route through.

## Census — every table name/link cell

Reference mechanism: `BAINameActionCell` → `BAILink type="hover"`.

**A. `BAINameActionCell` with a title link** (8) — sessions (`SessionNodes.tsx:173`),
deployments (`AdminDeployment.tsx:368`, `DeploymentListPage.tsx:325`,
`ProjectAdminDeploymentsPage.tsx:324`), RBAC roles
(`RBACManagementPage.tsx:356`), fair-share project / resource-group / domain
(`ProjectFairShareTable.tsx:124`, `ResourceGroupFairShareTable.tsx:125`,
`DomainFairShareTable.tsx:128`). Fixed by cause 1.

**B. `BAINameActionCellAstryx`** (2) — `VFolderNodes.tsx:265`,
`VFolderNodesV2.tsx:250`. Fixed by causes 1 + the class addition.

**C. `BAILink` used directly in a cell** (13) — agents
(`BAIAgentTable.tsx:635`), storage proxy (`StorageProxyList.tsx:149`), routes
(`BAIRouteNodes.tsx:150`), deployment replicas
(`DeploymentReplicasCard.tsx:460`), launcher mount table
(`VFolderTable.tsx:416`), session templates (`SessionTemplateModal.tsx:206`),
reservoir artifacts (`BAIArtifactTable.tsx:154`), `FolderLink.tsx:64`,
`BAIArtifactDescriptions.tsx:64`, `AdminModelCard.tsx:506`,
`EditableVFolderName.tsx:162`, `EditableFileName.tsx:158`,
`BAIAllowedVfolderHostsWithPermission.tsx:95`. Fixed by causes 1 and 2.

**D. `BAINameActionCell` with no link** (~28) and **E. plain-text name cells**
(~12) — out of scope: these are not links. They render `BAIText` / `Text` with
no `to` and no `onTitleClick` (users, projects, images, container registries,
resource policies, storage-permission tables, presets, …). Notable:
`ProjectAdminSessionPage.tsx:302` leaves the session name deliberately unlinked
(TODO FR-2944). Nothing here changed.

## Verification

`node .scratch/astryx-migration/shots/qa3-link-hover.mjs` walks 14 routes,
hovers each distinct link cell it finds in a table body, and reads
`text-decoration-line` on the link **and** on the box that actually paints the
glyphs — the second read is the whole point, since the first was already
passing before the fix.

**6/6 link cells underline on hover, in both light and dark**, across 6
different tables:

| Table | Route | Mechanism | Before | After |
|---|---|---|---|---|
| VFolders | `/data` | `BAINameActionCellAstryx` | NO UNDERLINE | OK |
| VFolders (admin) | `/admin/data` | `BAINameActionCellAstryx` | — | OK |
| Agents | `/agent` | `BAILink type="hover"` | NO UNDERLINE | OK |
| Allowed hosts | `/admin/project` | `BAILink` + nested `BAIFlex` | NO UNDERLINE | OK |
| Allowed hosts | `/resource-policy` | `BAILink` + nested `BAIFlex` | NO UNDERLINE | OK |
| Storage proxy | `/storage-settings/local:volume1` | `BAILink` | — | OK |

Raw readings: `shots/qa3/links-{before,after}-{light,dark}.json`. Hover
screenshots: `shots/qa3/hover-{before,after}-{light,dark}-*.png`.

Sessions / deployments / reservoir / model-store render no rows on the
`10.82.0.130:8090` cluster, so they could not be hovered live. They route
through the same `BAINameActionCell` → `BAILink type="hover"` path as `/agent`,
which is verified above.

`bash scripts/verify.sh` → ALL PASS. react vitest 1170 passed; BUI vitest 463
passed (3 `BAIFlex` style snapshots updated for the intended
`text-decoration: none` → `inherit` diff, no other change). BUI rebuilt.
