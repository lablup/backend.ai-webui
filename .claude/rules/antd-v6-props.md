---
description: Ant Design v6 prop names — historical reference for the antd-shaped BAI wrapper surfaces
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# Ant Design v6 Prop Conventions (historical reference)

> **antd is no longer a dependency of this project.** The to-astryx migration
> removed it entirely — `scripts/antd-zero-gate.sh` asserts it is absent from
> the production dependency graph, the built bundle and the source import
> graph. **Do not write new `antd` code.** New UI is Astryx; see the `ASTRYX`
> block in `AGENTS.md`.
>
> This file is kept because the prop VOCABULARY outlived the library. Many BAI
> wrappers (`BAIAlert`, `BAICard`, `BAITable`, `BAIModal`, `BAISelect`, …) were
> deliberately given an antd-v6-SHAPED prop surface so the several hundred call
> sites carried over from the antd era needed no edit when their internals were
> rebuilt on Astryx. When you extend one of those wrappers, or wonder why
> `BAIAlert` takes `title` rather than `message`, the table below is the answer.

## Why the v6 names, specifically

The wrappers were aligned to antd **v6** rather than v5 during the v5→v6
upgrade that preceded the migration. v6 renamed several props and marked the v5
names `@deprecated`; the v6 names are also the semantically clearer ones (e.g.
`orientation` describes an axis, `title` pairs naturally with `description`),
which is why they were the ones worth freezing into the BAI surface.

## Rules

1. **Do not add new `antd` imports.** They will not resolve — the package is
   not installed — and the gate would fail if they somehow did.
2. When adding a prop to a BAI wrapper whose surface is antd-shaped, use the v6
   name from the table below rather than inventing a third spelling. A wrapper
   whose props drift from both antd and Astryx is the worst of both.
3. If a wrapper's props interface still `Omit<>`s a name (see
   `component-props-extension.md`), that Omit targets the v6 name.
4. Prop names in the table that describe a mechanism Astryx does not have
   (`closable` objects, `progressDot`) may be accepted-and-ignored by the BAI
   wrapper. Each such case is recorded as a PILOT-DECISION in the wrapper's own
   header — check there before assuming a prop does anything.

## Known v5 → v6 Renames

The list below covers the renames this codebase encountered before antd was
removed. It is a historical record and will not grow.

| Component | v5 (deprecated) | v6 (use this) | Notes |
|---|---|---|---|
| `Alert` | `message` | `title` | Primary text of the alert. `description` is unchanged. |
| `Alert` | `closeText` | `closable.closeIcon` | Close UI moved inside the `closable` object. |
| `Alert` | `onClose` (top-level) | `closable.onClose` | |
| `Alert` | `afterClose` | `closable.afterClose` | |
| `Alert` | `closeIcon` (top-level) | `closable.closeIcon` | |
| `Steps` | `direction` | `orientation` | `'horizontal' \| 'vertical'`, same values. |
| `Steps` | `labelPlacement` | `titlePlacement` | `'horizontal' \| 'vertical'`, same values. |
| `Steps` | `progressDot` | `type="dot"` + `iconRender` | Dot-style steps now go through the unified `type` + `iconRender` API. |
| `Steps.Item` (`items[]`) | `description` | `content` | On each step item. |

## Examples

### Alert

```tsx
// ❌ Deprecated — triggers ts(6385)
<Alert type="error" message={errorTitle} description={detail} />

// ✅ v6
<Alert type="error" title={errorTitle} description={detail} />
```

### Steps

```tsx
// ❌ Deprecated — triggers ts(6385)
<Steps direction="vertical" current={currentStep} items={items} />

// ✅ v6
<Steps orientation="vertical" current={currentStep} items={items} />
```

### Steps with dot type

```tsx
// ❌ Deprecated — `progressDot` is gone in v7
<Steps progressDot current={currentStep} items={items} />

// ✅ v6
<Steps type="dot" current={currentStep} items={items} />
```

### Step items

```tsx
// ❌ Deprecated — `description` on StepItem is now `content`
<Steps items={[{ title: 'Auth', description: 'Verifying token' }]} />

// ✅ v6
<Steps items={[{ title: 'Auth', content: 'Verifying token' }]} />
```

## Verification

`bash scripts/verify.sh`. The old check here — "no `ts(6385)` (`is deprecated`)
diagnostics remain for antd prop usage" — has no subject any more; there is no
antd type to deprecate anything. What replaces it is
`bash scripts/antd-zero-gate.sh`, which fails if antd re-enters the project by
any route.
