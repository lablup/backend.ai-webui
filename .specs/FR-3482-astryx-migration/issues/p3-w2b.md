# p3 wave 2 — partition B (app components, 48 files)

**Target:** `to-astryx` (based on `3622a87a5`)
**Agent:** W2-B. Siblings: W2-A / W2-C (other app-component partitions), W2-D (BUI).

Scope: every antd **value** import in the 48 files of
`/home/ubuntu/.claude/jobs/19652f20/tmp/w2b.txt`. Type-only antd imports were
converted too — the `antd-import-graph` gate counts them (its specifier regex
matches `import type … from 'antd'`), so a file with only `import type
{ TagProps } from 'antd'` is still "direct antd".

Method per SKILL.md: classify → rename. MAPPING.md §2 verdict first, then the
per-component section. Idioms already ratified in wave 1 were reused verbatim
rather than re-derived (MetadataList for `Descriptions`, Banner for `Alert`,
`TabList` + self-rendered panel for `Tabs`, `IconButton` with a real
`label`, `badgeVariantForTagColor` for every `Tag` colour).

---

## Result

| | count |
|---|---:|
| files in partition | 48 |
| converted (direct-antd-free after) | **42** |
| left with a documented antd import | **6** |

`node scripts/migration-gates/antd-import-graph.mjs --list direct` — the six
partition-B files still listed are exactly the six recorded below; every other
partition-B file dropped out of the direct-antd set.

**Gate delta.** All 48 partition files carried a direct antd specifier before
this batch; 6 do now, so the repo-wide `direct antd` count goes **256 → 214**.

⚠️ The repo-wide **`antd-free` figure does not move** (267 / 27.6%, unchanged).
That is expected and worth stating plainly: every converted file here still
imports `backend.ai-ui`, and BUI is still direct-antd through
`locale/index.ts`, `theme-shim`, `app-shim`, `form-engine`, `BAISelect`,
`BAICard`, `BAIButton` … — the top taint hubs, each reaching 570+ files.
Partition B removes the *direct* edges it owns; the transitive count is pinned
until W2-D's BUI work lands. Judging this batch by `antd-free` would read as
"no progress", which is a measurement artifact, not a result.

Gates: `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, Lint, Format,
TypeScript, Vite warmup, StyleX injection, Astryx theme build, Terminology).
`react` vitest 1164/1164 pass; `backend.ai-ui` vitest 446 pass, 1 skipped.

## Live verification

Vite on `127.0.0.1:5860`, Playwright against `10.82.0.130:8090`, screenshots in
`.scratch/astryx-migration/shots/p3-w2b/` (capture scripts `w2b-shots.mjs`,
`w2b-shots2.mjs`, `w2b-launcher.mjs`, `w2b-fairshare.mjs`, `w2b-explorer.mjs`).

Ten surfaces, each in **light and dark**: Start, Data (folder list), session
launcher steps 1 / 2 / 4, Resource Policies, Users, Projects,
Scheduler → Fair Share (+ Domain drill-down), Admin → Configurations,
Environments, RBAC.

**Zero app console errors** across every pass. Three noise classes are filtered
in the capture scripts and were each confirmed pre-existing and unrelated:
the Geist webfont blocked by the dev CSP, `RelayResponseNormalizer` warnings
about the manager returning `Group`/`UserGroup` for one id, and one 404 asset.
Two warnings surfaced and were traced **out** of this batch:

- `[antd: Form.Item] name is only used for validate React element` on Data —
  raised by `FolderCreateModalV2` (wave 1, untouched here), whose
  `BAIFormItem name="host"` wraps a `<Suspense>`.
- `[antd: Divider] type is deprecated` on Scheduler — from
  `FairShareItems/DomainFairShareTable` and `ProjectFairShareTable`, which are
  **not** in this partition. The one `Divider type="vertical"` that *is*
  (`UserFairShareTable`) was converted to Astryx `orientation`.

**Not reachable on this backend, verified by compile + lint only:**

- `UserFairShareTable` / `UsageBucketModal` / `UsageBucketChartContent` — the
  fair-share scheduler is disabled for the only resource group on this cluster,
  so the drill-down stops at Domain.
- The **entire V1 folder-explorer chain** — `FolderExplorerModal` ←
  `FolderExplorerHeader` ← `FileBrowserButton`. Grepped: `FolderExplorerOpener`
  lazy-loads `FolderExplorerModalV2`, and nothing else imports the V1 modal, so
  these three are dead code behind the V2 flip. That also lowers the risk of
  the `FolderExplorerHeader` antd residue recorded above.
- `LegacyRolePermissionTab` / `LegacyRoleScopeTab` sit behind a sub-tab of the
  RBAC page that this cluster's data does not populate.

---

## The six files that keep an antd import (and why)

Each is a **frontier** or an explicit program-level exclusion, not an oversight.
None of them can be finished without editing files outside this partition.

### 1. `MainLayout/MainLayout.tsx` — theme-producer layer (EXCLUDED BY BRIEF)

`App` + `ConfigProvider`, driving the admin-scope accent swap alongside
`AstryxAdminTheme`. The two theming switches are independent (MAPPING §5), so
both must run until the last antd surface goes. Already documented in-file by
ticket 02/35. Final-switch material — untouched.

### 2. `LightDarkColorPicker.tsx` — genuine gap component

antd `ColorPicker` is verdict **NONE** in MAPPING §2 ("self-build"); ticket 22
already recorded the `astryx search "color picker"` result (no component hit).
The surrounding layout is already Astryx (`Grid` + theme-shim). Untouched.

### 3. `InputNumberWithSlider.tsx` — PARKED, FRONTIER-TRANSLATES

**The one substantive deferral in this batch.** Its public API *is* two antd
prop bags (`inputNumberProps: InputNumberProps`,
`sliderProps: SliderSingleProps | SliderRangeProps`) supplied by three call
sites outside this partition: `RuntimeParameterFormSection`,
`SessionFormItems/ClusterModeFormItems`,
`SessionFormItems/ResourceAllocationFormItems`.

Grepped what they actually pass — two things have no Astryx destination:

1. **React-node slider marks.** Astryx `Slider.marks` is
   `{value: number; label?: string}[]`; the label is a **string**. All three
   consumers position a `<RemainingMark />` element at a computed value. That
   element is inexpressible, so converting here would silently delete the
   "resource remaining" marker from the session launcher.
2. **`tooltip.open`.** `ResourceAllocationFormItems` force-hides the
   accelerator tooltip when no accelerator type is available.
   `formatValue` covers `tooltip.formatter` and nothing else.

`Space.Compact` + `addonBefore`/`addonAfter` would additionally have to become
an `InputGroup` whose children the consumers hand over as antd nodes.

Per the frontier rule this converts **with** its consumers, in the wave that
owns `SessionFormItems/`. Recorded in-file as a header block.

### 4. `FolderExplorerHeader.tsx` — one type reference into an unmigrated peer

Converted: `Grid.useBreakpoint` → `useBAIBreakpoint`, `Skeleton.Button` →
`BAISkeletonAstryx variant="button"`. What remains is `Typography.Title`, and
this file does not *render* it — it passes it as the `component` argument to
the still-antd `EditableVFolderName`, whose polymorphic
`component?: typeof Typography.Text | typeof Typography.Title` prop is the
contract. `EditableVFolderNameV2` already replaced that polymorphism with
`variant="title"` (see the fully-converted `FolderExplorerHeaderV2`), so this
import disappears when the V1 editable name follows.

### 5. `ImageEnvironmentSelectFormItems.tsx` — `Select.Option` / `Select.OptGroup`

Converted: `Divider`, `Input` (×2 → `AstryxFormTextInput`), `Tag` (×3 →
`Badge` via the ticket-13 lookup, including the runtime-arbitrary
`label.color` from image metadata), `Typography.Text copyable` → `BAIText`.
What remains is `Select` and `RefSelectProps`, which exist **only** as the
child/ref vocabulary of BUI's `BAISelect` — still an antd `Select` wrapper
(`packages/backend.ai-ui/src/components/BAISelect.tsx`, W2-D territory).
Replacing them here would mean rewriting the select for every consumer.

### 6. `ReverseThemeProvider.tsx` — theme-producer layer (EXCLUDED BY BRIEF)

The component *is* an antd `ConfigProvider`: it reads the parent algorithm off
`ConfigProvider.ConfigContext` and re-provides the inverted one. Nothing to
convert — the Astryx half already exists as
`astryx-theme/AstryxReverseTheme.tsx`, and all four call sites drive both.
A header note was added in-file; the code is untouched.

---

## PILOT-DECISIONs (things that lost or changed capability)

Ordered by blast radius. Every one is also a comment at the call site.

### D1 — `Tooltip` around a disabled control → the control's own tooltip slot

`FolderCreateModal` (×2), `ImportHuggingFaceModelForm` (×3),
`ImportFromHuggingFaceModal` (×1).

Astryx forbids wrapping a disabled trigger (it swallows the hover the wrapper
needs). Three shapes were used, by control:

- **`RadioListItem`** (FolderCreateModal's disabled "Project" / "Read-write"
  options): the explanation moves onto a `<TriangleAlertIcon>` in
  `endContent`, which is *not* disabled and therefore hoverable. This matches
  what `FolderCreateModalV2` already does.
- **`Button`** (ImportFromHuggingFaceModal's "Open model folder"): `tooltip`,
  passed only while the button is disabled.
- **`IconButton`** (ImportHuggingFaceModelForm's folder/create/refresh trio):
  `tooltip`, because **P18** — `IconButton` has no `disabledMessage`.

### D2 — antd `Tabs items` → `TabList` + self-rendered panel

`FairShareItems/UsageBucketChartContent`. `TabList` is navigation only, so the
active resource type became local state, declared with the other hooks so the
"no data" early return cannot reorder them.

### D3 — `DatePicker.RangePicker` → `DateRangeInput`, and the dayjs boundary

`FairShareItems/UsageBucketModal`. Values are `ISODateString`
(`YYYY-MM-DD` template literal), so a `toISODate(dayjs)` adapter sits at the
component boundary and the modal keeps its `[Dayjs, Dayjs]` state.
`presets[].value` becomes `presets[].getRange()`. **`needConfirm` is dropped**
— DateRangeInput commits on the second click and the existing `onChange` guard
already ignores half-picked ranges.

### D4 — `Splitter` → `useResizable` + `ResizeHandle`

`FolderExplorerModal`. The explorer panel was `resizable={false}`, so it simply
flexes; the description panel keeps the drag handle at its former 500px
default. Mirrors what `FolderExplorerModalV2` already shipped.

### D5 — `Result` → `EmptyState`

`ImportFromHuggingFaceModal`. `subTitle` → `description`, `extra` → `actions`.
**`status` has no knob**, so the success/error signal becomes the chosen icon
(`CircleCheckBig` / `CircleX`). `Result`'s `children` slot does not exist on
`EmptyState`, so the "Added items" detail block moved below it.

### D6 — `optionLabelProp="selectedLabel"` disappears

`ResourcePresetSelect`. Astryx `Selector` splits the concern natively —
`label` IS the plain trigger string (required, P2) and the rich popup row is
`renderOption` — so the parallel `selectedLabel` field is deleted rather than
emulated. `Select.OptGroup` → `{type: 'section'}`, which `Selector` supports
natively (better than MAPPING §3.1 assumed).

### D7 — `onOpenChange` refetch preserved via a `display: contents` wrapper

`ResourcePresetSelect` used antd's `onOpenChange` **only** to throttle-refetch
presets when the popup opened. Astryx `Selector` has no such callback. Rather
than lose the refresh, the same trigger is read one level up:
`<div style={{display:'contents'}} onPointerDownCapture={…}>`. Recorded because
it is a composition, not a rename.

### D8 — antd `Image preview={false}` → a bare `<img>`

`FileBrowserButton`, `FileBrowserButtonV2`. Astryx's image family
(`Thumbnail` / `Lightbox` / `AspectRatio`) is for *previewable* media; an 18px
icon with the lightbox switched off is an `<img>`, not a Thumbnail.

### D9 — `onPressEnter` dropped

`ImportFromHuggingFaceModal`'s Hugging Face URL field. The shared
`AstryxFormTextInput` adapter exposes no Enter hook, and widening the shared
adapter for one call site is out of this batch's scope. The explicit "Check"
button beside the field is unchanged and was always the primary path.

### D10 — `Input.Password` reveal toggle dropped

`ImportHuggingFaceModelForm`'s HF token field → `TextInput type="password"`.
antd's built-in eye toggle has no Astryx counterpart. `autoComplete="off"` also
has no adapter prop; the field is not a login credential.

### D11 — `TextArea autoSize` → fixed `rows`

`PrometheusQueryPresetEditorModal` (×2). Auto-growing has no Astryx
equivalent, so each box is fixed at its former `minRows`.

### D12 — `Input maxLength` dropped

`ImportRepoForm`'s GitLab branch field. Astryx `TextInput` has no length cap;
over-long branches fail server-side.

### D13 — `Empty.PRESENTED_IMAGE_SIMPLE` dropped, `description` becomes `title`

`QuotaScopeTable`, `QuotaPerStorageVolumePanelCard`,
`ImportFromHuggingFaceModal`, `FairShareItems/UsageBucketChartContent`.
`EmptyState.title` is a required string, so a previously image-only empty state
gains the wording it always implied. Consistent with wave 1
(`DeploymentCurrentRevisionTab`, `QuotaPerStorageVolumeDashboardItem`).

### D14 — `Descriptions` loses `bordered` / `size="small"` / per-item `span`

`FairShareItems/UsageBucketModal`, `InferenceSessionErrorModal`,
`LaunchMultipleSessionsModal`. Project-wide since ticket 15/18.
`InferenceSessionErrorModal`'s breakpoint-map `column` collapsed to
`columns="single"` because every breakpoint already asked for one column.

### D15 — `NonLinearSlider` re-based on Astryx, not translated

It has **zero** call sites in `react/src`, `packages/backend.ai-ui/src` and
`e2e` (grepped). The frontier rule therefore does not apply, so its props now
extend Astryx `SliderSingleProps`. antd's `' '` spacer marks become marks with
no label — which is what they always meant.

### D16 — `PortTag` / `ImageTags` prop surfaces restated (P1 applied)

Both extended antd `TagProps` for consumers that never used it. Grepped, not
guessed: `PortTag`'s single call site (`SessionLauncherPreview`) passes
`value`/`style`/children, and no `ImageTags` call site passes anything beyond
`color`. Replaced by minimal local interfaces.

### D17 — `RcFile` restated locally, exported from `FileUploadManager`

`FileUploadManager`, `FolderExplorerModal`, `FolderExplorerModalV2` all imported
`RcFile` from `antd/es/upload`. Declared once as
`interface RcFile extends File { uid: string; readonly lastModifiedDate: Date }`
(verbatim: rc-upload's `RcFile` + antd's added field), exported from
`FileUploadManager` — the module the other two already import from. Structural,
so it stays mutually assignable with BUI's still-antd `BAIFileExplorer.onUpload`
signature while that side of the frontier catches up.

### D18 — `Popconfirm` → `BAIPopconfirmAstryx`, not `AlertDialog`

`ImportArtifactRevisionToFolderModal`. Switching the current project is
reversible, so it stays in the anchored-confirmation tier that
`.claude/rules/destructive-confirmation.md` reserves for reversible actions.

### D19 — antd static `message` → the app-shim

`ImportRepoForm` imported `message` from `antd` directly while already holding
`App.useApp()`. All eight call sites now go through `app.message`.

### D20 — `Switch` gains a hidden label beside its caption

`ImportFromHuggingFaceModal`'s "Import only" toggle. Astryx `Switch.label` is
required and self-rendered, so it carries `label` + `isLabelHidden` and the
existing sibling caption stays as the visible text. Avoids double-rendering.

---

## Notes for the orchestrator

- **`InputNumberWithSlider` should be handed to whoever owns
  `SessionFormItems/`.** It is the only file in this partition whose conversion
  is blocked on a real capability gap (node-labelled slider marks) rather than
  on ordering.
- `ImageEnvironmentSelectFormItems` and `FolderExplorerHeader` each fall out
  for free once BUI `BAISelect` and `EditableVFolderName` (V1) convert. No work
  is queued for them beyond that.
- `BAICard` (BUI, still antd) is used by two files in this partition
  (`HuggingFaceModelPreview`, `ImportFromHuggingFaceModal`), matching the 59
  files repo-wide that already do. It is a transitive edge, not a direct one.
