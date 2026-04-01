---
description: When creating wrapper components that extend Ant Design components
---

# Component Props Extension Rule

When creating a BAI wrapper component that extends an Ant Design component, the component's props interface **must** extend the original Ant Design component's props type.

## Why

Extending the original props ensures that consumers can pass any prop supported by the underlying Ant Design component (e.g., `className`, `style`, event handlers) without the wrapper having to redeclare them. It also keeps IDE autocomplete and type checking consistent.

## Pattern

```tsx
// ✅ Correct — extends the original props, Omit only what is overridden or internally fixed
export interface BAIExampleProps extends Omit<OriginalProps, 'overriddenKey'> {
  overriddenKey?: CustomType;
}

// ❌ Wrong — standalone interface, loses all original props
export interface BAIExampleProps {
  overriddenKey?: CustomType;
}
```

### Examples

```tsx
// BAICard — overrides `extra` with a different type
export interface BAICardProps extends Omit<CardProps, 'extra'> {
  extra?: ReactNode;
  status?: 'success' | 'error' | 'warning' | 'default';
}

// BAIBadge — overrides `color`, fixes `status` and `styles` internally
export interface BAIBadgeProps extends Omit<BadgeProps, 'color' | 'status' | 'styles'> {
  color?: SemanticColor;
  processing?: boolean;
}
```

## Rules

1. Use `Omit<OriginalProps, 'overriddenKeys'>` to exclude props that the wrapper redefines with different types.
2. Also Omit props that are internally fixed and should not be overridden by consumers (e.g., `status`, `styles` when the component enforces a specific visual style).
3. If a prop has the same type and semantics as the original, do **not** Omit it — let it pass through naturally.
4. Pass remaining props through via `...rest` to the underlying Ant Design component.
