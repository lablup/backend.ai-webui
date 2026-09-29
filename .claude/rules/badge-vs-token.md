---
description: Draw a value the system changes on its own as an Astryx Badge and a value only a user edits (or a category label) as an Astryx Token; name chip components *Badge / *Token by what they render
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# Badge vs Token Rule

Every chip in this project is either an Astryx `Badge` or an Astryx `Token`,
and **the way the value changes picks the primitive**:

- **`Badge`** — a value the **system changes on its own**: lifecycle / health
  status, in-progress markers (Installing, Deploying, Applying), system
  pointers that move under the user (Current, Latest), live tickers and
  metrics, and **counts**.
- **`Token`** — a value that changes **only when a user or admin edits it**, or
  a **category / classification label**: names, types, permissions, versions,
  tags and labels, on/off settings, and **recorded outcomes** (a login result,
  an audit row's status, an error record).

`StatusDot` (via `BAIBadge`) stays for dot-only status and is outside this rule.
The decision is ADR 0007 (`docs/adr/0007-badge-for-live-values-and-token-for-settled-values.md`).

## Why

After FR-4002's theme change the two primitives look different on purpose:
`Token` is an outline on a transparent fill, `Badge` is a tinted fill with an
outline and dark text. A filled chip reads as "a state right now", an outlined
chip reads as "a value". Drawing a username with a `Badge`, or a session status
with a `Token`, tells the user the wrong thing.

The Astryx-generated agent block says "Status = StatusDot/Token; Badge = counts
only". This repository overrides that line (the `STATUS SEMANTICS` line under
it in `AGENTS.md`): status shown as a labelled chip is a `Badge` here.

## Rules

1. **Pick the primitive by how the value changes**, not by colour or by what
   the neighbouring code used. Answer the question in "How to decide" below.
2. **Counts are `Badge`** (`BAIBadgeCount`, `BAITabCountBadge`, `+N` overflow).
3. **One slot, one primitive.** When a slot can show either a live marker or a
   pointer (e.g. `Deploying` or `Current`), both are `Badge` — never a `Token`
   and a `Badge` alternating in the same place.
4. **Colour only through `astryxTagVariant.ts`** (re-exported by
   `backend.ai-ui`): `badgeVariantForStatus` / `badgeVariantForTagColor` for a
   `Badge`, `tokenColorForStatus` / `tokenColorForTagColor` for a `Token`,
   `PRIMARY_TOKEN_COLOR` for a main-key marker. Do not add a per-file
   status→colour map; add the domain to `STATUS_BADGE_VARIANT`. Never pass a hex
   string as a colour.
5. **Name chip components by the primitive they render**: `*Badge` or
   `*Token`. "Tag" is only a domain noun (image tag, deployment tag) — never the
   chip suffix. Do not reintroduce a generic `BAITag` / `*Tag` / `*Chip` wrapper.
6. **Welded pairs**: `BAIDoubleToken` for settled pairs, `BAIDoubleBadge` for
   live pairs. There is no switch prop between them.
7. **`Token.label` is a string. Do not fall back to `Badge` for that reason.**
   A glyph goes in `icon`; composite text is flattened to one string; search
   highlighting uses `label={plain}` + `isLabelHidden` +
   `endContent={<BAITextHighlighter keyword={kw}>{plain}</BAITextHighlighter>}`.

## Pattern

### ❌ Wrong — a settled value drawn as a Badge

```tsx
// A permission changes only when an admin edits it.
<Badge variant="success" label={permission} />
```

### ❌ Wrong — a live status drawn as a Token

```tsx
<Token color="green" label={session.status} />
```

### ❌ Wrong — a local colour map, or a Badge kept only for a highlighted label

```tsx
const colorMap = { ACTIVE: 'green', INACTIVE: 'orange' };
<Badge variant={badgeVariantForTagColor(colorMap[role.status])} label={<BAITextHighlighter keyword={kw}>{role.name}</BAITextHighlighter>} />
```

### ✅ Correct — live status as a Badge, colour from the helper

```tsx
import { Badge } from '@astryxdesign/core/Badge';
import { badgeVariantForStatus } from 'backend.ai-ui';

<Badge variant={badgeVariantForStatus('route', route.status)} label={route.status} />
```

### ✅ Correct — settled value as a Token, colour from the helper

```tsx
import { Token } from '@astryxdesign/core/Token';
import { tokenColorForStatus } from 'backend.ai-ui';

<Token color={tokenColorForStatus('role', role.status)} label={role.status} />
```

### ✅ Correct — Token with search highlighting

```tsx
<Token
  color="blue"
  label={tag}
  isLabelHidden
  endContent={<BAITextHighlighter keyword={keyword}>{tag}</BAITextHighlighter>}
/>
```

### ✅ Correct — welded pairs

```tsx
<BAIDoubleToken values={[{ label: 'CUDA', color: 'green' }, { label: version }]} />
<BAIDoubleBadge
  values={[
    { label: agent.status, variant: badgeVariantForStatus('agent', agent.status) },
    { label: elapsed },
  ]}
/>
```

## How to decide

Ask: *"Can this value change while the user is looking at the screen, without
the user doing anything?"*

- **Yes** → `Badge` (status, progress, tickers, Current / Latest pointers).
- **No** → `Token` (names, types, permissions, versions, tags, settings,
  recorded outcomes).
- **It is a number of things** → `Badge`.
- **Only a dot is shown** → `StatusDot` / `BAIBadge`; this rule does not apply.

A history row's status ("succeeded", "failed") is written once and never moves,
so it is a `Token` even though it came from the system.

## Verification

After touching a chip in `react/src/**` or `packages/backend.ai-ui/src/**`:

- Each `Badge` / `Token` passes the "How to decide" question.
- Colours come from `badgeVariantFor*` / `tokenColorFor*` / `PRIMARY_TOKEN_COLOR` — no new per-file map, no hex.
- No new component name ends in `Tag` / `Chip` unless "Tag" is the domain noun.
- `bash scripts/verify.sh` passes.

## Related

- ADR 0007 — `docs/adr/0007-badge-for-live-values-and-token-for-settled-values.md`
- ADR 0005 — `docs/adr/0005-container-image-meta-row.md` (image tag chips are `Token`s)
- Colour helper — `packages/backend.ai-ui/src/helper/astryxTagVariant.ts`
- `component-props-extension.md` — what a `*Badge` / `*Token` wrapper's props extend
