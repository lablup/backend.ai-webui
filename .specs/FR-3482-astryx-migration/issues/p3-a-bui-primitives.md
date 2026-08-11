# Phase 3 · ticket A — BUI display primitives → Astryx

In-place frontier rewrites of the `backend.ai-ui` display primitives. Every
component keeps its **antd-shaped public prop surface** (frontier rule), so no
consumer file changes; only the internals move to Astryx, and the antd *type*
imports are replaced by locally-declared equivalents so the modules drop out of
the antd import graph (P15).

Scope: `BAIText`, `BAILink`, `BAITag`, `BAIBadge`, `BAIAlert`,
`BAIAlertIconWithTooltip`, `BAIStatistic`, `TotalFooter` (BUI **and** its
`react/src/components` twin), `fragments/BAIArtifactTypeTag`, `BAIFlex`
(type-only antd import), plus the one consumer fix `BAIDeploymentStatusTag`
required by the `BAITag` colour contract.

---

## Conversion table

| Component | Astryx target | Contract kept? | Dropped / changed |
|---|---|---|---|
| `BAIText` | `Text` (+ `Code`, `IconButton`, `Tooltip`, `Link`, `useTruncation`) | ✅ all antd `Typography.Text` props except `editable` | `editable` (D1); tooltip `placement`/`color` overrides (D2) |
| `BAILink` | react-router `Link` (`to`) / Astryx `Link` (`onClick`, `disabled`) | ✅ | `Typography.Link` → `<button>` semantics for pure-`onClick` sites (D3) |
| `BAITag` | `Badge` / `Token` (on `closable`) | ✅ | the entire antd `ConfigProvider` re-theme (D4) |
| `BAIBadge` | `StatusDot` + `Text` | ✅ | — (unknown-state outline dot preserved via co-located CSS, D5) |
| `BAIAlert` | `Banner` | ✅ | `showIcon` (no-op), `ghostInfoBg` (no-op, D6), the blank-description NEO hack (D7) |
| `BAIAlertIconWithTooltip` | `Tooltip` + lucide glyph | ✅ (`title`) | the rest of antd `TooltipProps` beyond `placement` (unused) |
| `BAIStatistic` | `Text` + `Tooltip` + rebuilt notch bar | ✅ | `Progress steps` rebuilt rather than flattened (D8) |
| `TotalFooter` (×2) | `Text color="secondary"` | ✅ | — |
| `BAIArtifactTypeTag` | `Badge` (`icon` + `variant`) | ✅ | per-type hex icon tint → whole-chip category variant (D9) |
| `BAIFlex` | unchanged render | ✅ | `type { GlobalToken } from 'antd'` → shim-derived key type |
| `BAIDeploymentStatusTag` | (consumer fix) | ✅ | passes the SemanticColor **name**, not a resolved hex (D10) |

---

## PILOT-DECISIONs

**D1 — `BAIText editable` is dropped.** antd's inline-edit affordance has no
Astryx counterpart and **no production call site** — only `BAIText.stories.tsx`
used it (the one real inline-edit surface, `FileExplorer/EditableFileName`,
calls antd `Typography.Text` directly and is out of this scope). The story is
rewritten around `copyable`, which is kept.

**D2 — an ellipsis tooltip's `placement` / `color` are dropped.** antd let each
`ellipsis={{tooltip: {…}}}` carry a full `TooltipProps`. Astryx's truncation
tooltip is positional-default; a *custom tooltip target* (a different string, or
`{title}`) is still honoured — those sites get an explicit `Tooltip anchorRef`
gated on `useTruncation().isTruncated`, i.e. the same "only when clamped"
behaviour antd had. Only the per-site placement/colour knobs go.

**D3 — a pure-`onClick` `BAILink` now renders a `<button>`.** Astryx `Link`
with no `href` renders a link-styled button, which is the correct semantics for
the 25 measured `onClick`-only sites (antd rendered a destination-less `<a>`).
`to`-carrying links keep the react-router `Link` element unchanged: Astryx's
`as=` contract is href-first and cannot take a react-router `To` object, and
keeping the router element is also the zero-visual-risk choice.

**D4 — `BAITag`'s antd re-theme is dropped.** The wrapper's only substance under
antd was a `ConfigProvider` block forcing `defaultBg`/`colorInfoBg`/… to
`transparent`, `colorText: #999999`, `borderRadiusSM: 11`, plus
`paddingInline: token.paddingSM`. That is the P5/P11 shape — a wrapper that
existed only to re-theme antd has nowhere to land. `Badge`'s look is closed and
theme-owned; reproducing the outline/grey chip would need a per-component CSS
block fighting `astryx-base` on all 14 variants. Tags now render as Astryx
badges.

**D5 — the unknown-status outline dot is KEPT (co-located CSS, justified).**
`BAIBadge` distinguishes "status known and is X" from "status unknown /
indeterminate"; `StatusDot`'s enum (`success|warning|error|accent|neutral`) has
no outline member, so collapsing to `neutral` would erase information
(`BAIAuditLogStatusTag`'s `UNKNOWN`, `StorageUsageBadge`'s missing percent).
`BAIBadge.css` paints exactly what antd's `styles.indicator` override did, in
tokens.

**D6 — `BAIAlert ghostInfoBg` is a no-op.** It repainted an `info` alert with the
surface background + neutral border (one live opt-out site,
`BAIProjectBulkEditModal`). `Banner` owns its header colour per `status` and
exposes no knob; the standing decision on this branch is that Banner keeps its
DEFAULT Astryx style. The prop stays in the signature for source compatibility.

**D7 — the `description={description || ' '}` hack is dropped.** It forced
antd's two-line "NEO" layout. `Banner` lays out title/description natively, and
a description-only call site promotes its description into the required `title`
slot rather than rendering an empty header.

**D8 — `BAIStatistic`'s segmented bar is REBUILT, not flattened.** Astryx
`ProgressBar` is a continuous track with no `steps`. The 20-notch bar is the
recognisable shape of the dashboard/resource panel (it is what separates 3/20
from 4/20 at a glance), so `BAIStatistic.css` reproduces antd's exact geometry
(`size={[3, 10]}` → 3×10px notches, 2px gap) in tokens, with
`role="progressbar"` + `aria-valuenow` so nothing is lost against either antd or
`ProgressBar`. This is the "per-page ORIGINAL FIDELITY beats a generic
convention" corollary; recorded here as the per-component-CSS policy requires.

**D9 — `BAIArtifactTypeTag`'s per-type icon hexes become category variants.**
The hard-coded `#1677ff` / `#52c41a` / `#fa8c16` were antd's own `blue-6` /
`green-6` / `orange-6` presets, i.e. the category-colour axis Astryx `Badge`
carries as non-semantic variants. The badge now tints the whole chip instead of
only the glyph — that IS `Badge`'s category treatment, and it is the
defaults-first answer to "an arbitrary colour is inexpressible" (P5).

**D10 — `BAIDeploymentStatusTag` must pass a semantic NAME.** It handed `BAITag`
`useSemanticColorMap()[…]`, a resolved hex. `badgeVariantForTagColor`'s closed
enum cannot express an arbitrary colour, so every deployment status would have
silently dropped to `neutral` (astryxTagVariant policy class 5). Fixed at the
source: it now passes `deploymentStatusSemanticMap[status]`, which the lookup
accepts directly (policy class 6). **This is the failure mode the ticket-13
lookup exists to prevent, and it is invisible to `tsc`** — worth a grep on the
remaining `<BAITag color={…}>` sites in later waves.

---

## Theme change (THEME DEFAULTS, not per-component CSS)

`THEME_NAME_REV` **5 → 6**; artifacts regenerated
(`bai-r6-default-brand-h1gij33a.{js,d.ts,variants.d.ts}` +
`backendai-default-built.css`; the r5 set deleted; `built/index.ts` re-pointed).
`scripts/verify.sh`'s `astryx theme build --check` passes.

**What changed:** `STATUS_TEXT_COLORS` in
`react/src/astryx-theme/backendAiTheme.ts` adds three custom `Text`/`Heading`
colours:

```
'color:danger'  -> var(--color-error)
'color:warning' -> var(--color-warning)
'color:success' -> var(--color-success)
```

**Why the theme and not inline CSS.** MAPPING §3.4 flags antd
`Typography.Text type="danger|warning|success"` as "a design decision, 12
times" (measured here: 14 live sites). Astryx documents a custom theme colour as
the supported escape hatch — `Text` resolves an unknown `color` to the `primary`
StyleX baseline and takes its actual colour from theme CSS
(`.astryx-text.<color>`), and `astryx theme build` emits the matching
`TextColorMap` module augmentation so `color="danger"` type-checks. One decision,
one place, inherited by every family/role theme. The values are legacy-identical
by construction: antd painted those three types from
`colorError`/`colorWarning`/`colorSuccess`, the same `resources/theme.json`
seeds this recipe already pins to `--color-error`/`--color-warning`/
`--color-success`. **No new literal was introduced.**

Two mirrors had to follow:

- `packages/backend.ai-ui/src/astryx-theme-augmentations.d.ts` — BUI is a
  separate TS project and never sees the generated `.variants.d.ts` under
  `react/src`. Hand-written copy, marked KEEP IN SYNC.
- `packages/backend.ai-ui/.storybook/astryxBrandTheme.ts` — the Storybook mirror
  of the brand theme (already marked KEEP IN SYNC). Without it the semantic
  types render as plain body text in Storybook while looking correct in the app
  — verified: the first screenshot pass showed exactly that, the second (after
  syncing) shows the colours.

---

## i18n

`general.button.Copy` added to all 21 BUI locale files (the accessible name +
tooltip of the rebuilt copy control). `general.button.Copied` already existed;
`Collapse`/`Expand` (the expandable-ellipsis link) were already present.

---

## Per-component CSS added (tokens only, P19-checked)

| File | Why |
|---|---|
| `BAIText.css` | `keyboard` chip (Astryx `Kbd` takes a `keys: string` shortcut spec, not arbitrary children), `mark` (MAPPING: "NONE — self-build"), the `code` chip footprint, and the copy-control row layout |
| `BAIBadge.css` | dot+label row layout; the unknown-status outline dot (D5) |
| `BAIStatistic.css` | the notch bar (D8) + the two literal font sizes antd used (32px value, `fontSizeLG` caption) |

`BAIAlert.css` was **deleted** — every rule in it targeted `.ant-alert-*`, which
`Banner` does not emit (P6). `BAILink.css` is unchanged and still live (its rules
target our own classes, not antd's).

---

## Handoff — dead `.ant-*` rules created for sibling C (select flip)

`packages/backend.ai-ui/src/components/BAISelect.css` styles BUI primitives
rendered *inside* an antd `Select`:

```
.bai-select .ant-select-content-has-search-value .ant-badge     (opacity 0)
.bai-select .ant-select-content-has-search-value span.ant-tag   (opacity 0)
.bai-select.ant-select-open .ant-select-content .ant-badge      (opacity .5)
.bai-select.ant-select-open .ant-select-content span.ant-tag    (opacity .5)
.bai-select.ant-select-open .ant-select-content .ant-typography-{secondary,success,warning,danger}
```

Those descendants are now `.astryx-badge` / `.astryx-text`, so the five rules are
**dead** (P6 — they still compile and silently stop applying). The file belongs
to the select flip, so it was deliberately NOT edited here; whoever owns
`BAISelect` should either add the Astryx counterparts to those selector lists or
drop the rules with the wrapper.

---

## Known residue (NOT fixed here — infra owned elsewhere)

Both are **type-only** antd imports in shared infra, each a documented decision,
and each keeps ~600 files transitively "antd-reachable" in the import-graph gate
even though nothing antd is emitted:

- `packages/backend.ai-ui/src/theme-shim/index.tsx` — `type { GlobalToken } from 'antd'`
  (the shim's whole contract is to return antd's token *type*; final-switch material).
- `packages/backend.ai-ui/src/locale/index.ts` — `type { Locale } from 'antd/es/locale'`
  (ticket 30's optional-peer payload, explicitly `import type` so it never emits).

Every file in this ticket's scope is now free of **direct** antd imports.
