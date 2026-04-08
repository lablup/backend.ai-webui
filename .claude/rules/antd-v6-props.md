---
description: Use Ant Design v6 prop names; avoid deprecated v5 props
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# Ant Design v6 Prop Conventions

This project uses **Ant Design 6** (`antd@6.x`). Several props were renamed in v6 and the v5 names are marked `@deprecated` in the type definitions. Always use the v6 prop names when writing or editing code that touches `antd` components.

## Why

Deprecated props still compile and render, but they:

1. Produce TypeScript `6385` diagnostics (`'X' is deprecated`) on every file that uses them.
2. Will be removed in v7 — using v6 names up front avoids a future churn pass across the codebase.
3. The v6 names are semantically more accurate (e.g. `orientation` clearly describes an axis; `title` pairs naturally with `description`).

## Rules

1. Always use the v6 prop name when adding or editing any `antd` component usage. Do not introduce a deprecated v5 prop on a new or modified call site.
2. When editing a file that already uses a deprecated prop, migrate it in the same change. For simple deprecated aliases (e.g. `Steps.direction` → `orientation`, `Alert.message` → `title`) this is a pure rename with no behavior difference and is safe to apply mechanically. Some deprecations are **not** pure renames and require an API/behavior review before migration — for example, `Steps.progressDot` moves to `type="dot"` + `iconRender`, and `Alert.closeText`/`onClose`/`afterClose` move into a `closable` object. Treat these as structural migrations, not aliases.
3. If a wrapper component re-exports `antd` props (see `component-props-extension.md`), ensure its `Omit<>` list targets the v6 name, not the deprecated alias.
4. When in doubt, open the component's `.d.ts` under `node_modules/.pnpm/antd@6.*/node_modules/antd/es/<component>/` and check which props carry the `@deprecated` JSDoc tag.

## Known v5 → v6 Renames

The list below covers the renames encountered in this codebase. It is not exhaustive — always verify against the installed `antd` type definitions for anything not listed here.

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

When you finish editing a file that touches `antd` components, run `bash scripts/verify.sh` and ensure no `ts(6385)` (`is deprecated`) diagnostics remain for `antd` prop usage in your changes.
