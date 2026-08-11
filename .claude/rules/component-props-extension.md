---
description: What a BAI wrapper component's props interface must extend — the Astryx / DOM / BUI-wrapper / third-party props type it actually renders, not antd
---

# Component Props Extension Rule

When creating a BAI wrapper component, the component's props interface **must** extend the props type of whatever it actually wraps.

> **History.** This rule used to read "must extend the original Ant Design
> component's props type", and its worked examples were
> `BAICardProps extends Omit<CardProps, 'extra'>` and
> `BAIBadgeProps extends Omit<BadgeProps, …>`. antd is no longer a dependency
> of this project — an `antd` import does not resolve — so `CardProps` /
> `BadgeProps` from `antd` do not exist and neither example compiles. The
> **principle** is unchanged — only the base is. Note that a wrapper's
> antd-shaped prop *vocabulary* is a separate, frozen concern — see "Frozen
> antd-v6-shaped prop vocabulary" below.

## Why

Extending the wrapped component's props ensures that consumers can pass any prop it supports (e.g., `className`, `style`, event handlers) without the wrapper having to redeclare them. It also keeps IDE autocomplete and type checking consistent.

## Choosing the base

The principle is library-agnostic: **extend the props type of whatever the
wrapper actually renders**, wherever that type comes from. These are the common
instances, not a closed list.

1. **The Astryx component's props type** — the default when the wrapper wraps
   one Astryx primitive and passes the rest through.
   (`BAITabListProps extends Omit<TabListProps, 'ref'>`,
   `BAIMetadataListProps extends MetadataListProps`.)
2. **A DOM props type** (`React.HTMLAttributes<HTMLDivElement>`, …) — when the
   wrapper *composes* several Astryx primitives, so there is no single upstream
   props type to inherit, but it still renders one host element consumers
   should be able to reach. (`BAICardProps`, `BAITextProps`, `BAIButtonProps`.)
3. **Another BUI wrapper's props type** — when the wrapper specializes an
   existing `BAI*` component. (`BAIListAlertProps` on `BAIAlertProps`,
   `BAIDeleteConfirmModalProps` on `BAIModalProps`,
   `BAIArtifactTableProps` on `BAITableProps<Artifact>`.)
4. **Another library's props type** — when the wrapper is built on a
   non-Astryx third party. `BAILinkProps extends Omit<LinkProps, 'to'>` where
   `LinkProps` is **react-router-dom's**, because `BAILink` renders a router
   `Link`.

## Pattern

```tsx
// ✅ Correct — extends the wrapped component's props, Omit only what is overridden or internally fixed
export interface BAIExampleProps extends Omit<WrappedProps, 'overriddenKey'> {
  overriddenKey?: CustomType;
}

// ❌ Wrong — standalone interface with no base, silently dropping everything the
//    wrapped component supports (see the escape hatch below for the one case
//    where this is deliberate)
export interface BAIExampleProps {
  overriddenKey?: CustomType;
}
```

### Examples

```tsx
// (1) Astryx base — BAIPopconfirmAstryx wraps Astryx `Popover`; `content` is
//     Omitted because this component OWNS the popover content.
//     react/src/components/astryx-bui/BAIPopconfirmAstryx.tsx
import type { PopoverProps } from '@astryxdesign/core/Popover';

export interface BAIPopconfirmAstryxProps extends Omit<
  PopoverProps,
  'content' | 'label'
> {
  title: React.ReactNode;
  isDanger?: boolean;
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

// (1) Astryx base — BAIBadgeCountAstryx wraps Astryx `Badge`.
//     NOTE: `BadgeProps` here is ASTRYX's, not antd's. It is the only live
//     `BadgeProps` in the repo.
//     react/src/components/astryx-bui/BAIBadgeCountAstryx.tsx
import type { BadgeProps } from '@astryxdesign/core/Badge';

export interface BAIBadgeCountAstryxProps extends Omit<
  BadgeProps,
  'label' | 'icon'
> {
  count?: number | React.ReactNode;
  hasDot?: boolean;
}

// (2) DOM base — BAICard composes Astryx `Card` + `Heading` + `Divider` +
//     `TabList` + `Skeleton`, so there is no single props type to inherit.
//     packages/backend.ai-ui/src/components/BAICard.tsx
export interface BAICardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'color' | 'children'
> {
  status?: 'success' | 'error' | 'warning' | 'default';
  title?: ReactNode;
  extra?: ReactNode;
  // …the antd-`Card`-shaped surface, hand-restated — see the escape hatch below
}

// (3) BUI base — specializing an existing BAI component.
//     packages/backend.ai-ui/src/components/BAISchedulingResultBadge.tsx
export interface BAISchedulingResultBadgeProps extends Omit<
  BAIBadgeProps,
  'text' | 'color'
> {
  result: SchedulingResult | null;
}

// (3) BUI base — packages/backend.ai-ui/src/components/BAIListAlert.tsx
export interface BAIListAlertProps extends Omit<BAIAlertProps, 'description'> {
  items: Array<BAIListAlertItem>;
  maxHeight?: React.CSSProperties['maxHeight'];
}
```

## Rules

1. Use `Omit<WrappedProps, 'overriddenKeys'>` to exclude props that the wrapper redefines with different types.
2. Also Omit props that are internally fixed and should not be overridden by consumers, and props the wrapper itself OWNS (e.g. `content` on a popover whose body the wrapper renders).
3. If a prop has the same type and semantics as the original, do **not** Omit it — let it pass through naturally.
4. Pass remaining props through via `...rest` to the component being wrapped (`{...popoverProps}`, `{...cardProps}`, …).
5. When the base is another BUI wrapper, extend **that wrapper's** exported props type — do not reach past it to the Astryx type it happens to sit on. The intermediate wrapper's overrides are part of the contract you are specializing.
6. Do **not** reintroduce an `antd` import to obtain a base type. antd is not a dependency of this project, so the import will not resolve.

## Escape hatch — a deliberately hand-restated surface

A wrapper may declare its props **standalone**, restating a frozen antd-SHAPED surface inline instead of inheriting one, when its file header says so — the migration marks these with a `PILOT-DECISION` / `FRONTIER COMPONENT` note. Two live cases:

- `BAICard.tsx` — the antd-`Card`-shaped props (`tabList`, `bordered`,
  `type="inner"`, the `styles` slot map, …) are restated inline so the module
  drops out of the antd import graph (policy P15) while its ~200 call sites
  keep compiling untouched. Each accepted-and-ignored prop is documented as a
  `PILOT-DECISION` in the file header.
- `BAIBadge.tsx` — `BAIBadgeProps` is fully standalone (`color`, `processing`,
  `text`, `className`, `style`). The component renders Astryx `StatusDot` +
  `Text`, and `StatusDot`'s props are not the surface consumers pass, so there
  is nothing useful to inherit.

Two conditions make this legitimate rather than the ❌ pattern above: the surface is **frozen** (it exists to keep existing call sites compiling, not to grow), and the reason is **written down in the file header**. If neither holds, extend a base type.

"Written down" means a **short** note — the constraint and a pointer, not a design history. See `comment-density.md`: the reasoning behind the decision belongs in the commit body and the PR that made it; the file header carries the one sentence a reader needs to not undo it.

## Frozen antd-v6-shaped prop vocabulary

Many BAI wrappers (`BAIAlert`, `BAICard`, `BAITable`, `BAIModal`, `BAISelect`, …)
were deliberately given an antd-**v6**-shaped prop surface, so the several
hundred call sites carried over from the antd era needed no edit when their
internals were rebuilt on Astryx — e.g. `BAIAlert` takes `title` (not
`message`), and `Steps` takes `orientation` (not `direction`). These were
aligned to antd v6 specifically because v6 renamed the v5 names as
`@deprecated` and picked the semantically clearer spelling.

**Do not rename these props to "modernize" them.** The vocabulary outlived the
library on purpose — renaming would break every existing call site for no
benefit. When a wrapper's props interface `Omit<>`s one of these names, target
the **v6** name, not the v5 one. New props added to an antd-shaped wrapper
should also follow the frozen v6 spelling rather than inventing a third one.

## Verification

- The wrapper's props interface names a base that actually exists in the repo:
  an `@astryxdesign/core/*` props type, a `React.*HTMLAttributes<…>`, an
  exported `BAI*Props`, or the props type of whatever third-party component it
  renders. No `import … from 'antd'`.
- `...rest` reaches the wrapped component.
- If the interface is standalone, the file header carries the
  `PILOT-DECISION` / `FRONTIER COMPONENT` note that justifies it.
- `bash scripts/verify.sh` passes.

## Related

- `use-bai-card.md` — `BAICard`'s own conventions; its props are the DOM-base
  plus hand-restated case above.
- `BAICard` source: `packages/backend.ai-ui/src/components/BAICard.tsx`
- `BAIBadge` source: `packages/backend.ai-ui/src/components/BAIBadge.tsx`
