# BAINameActionCell — Reusable Table Cell Layout Component

> **Status**: Implemented
> **Date**: 2026-03-28
> **Issue**: [FR-2408](https://lablup.atlassian.net/browse/FR-2408)
> **Implemented**: PR [#6247](https://github.com/lablup/backend.ai-webui/pull/6247)

## Overview

A reusable table cell layout component that combines a title area (icon + text) with responsive action buttons. When the column is wide enough, all action buttons are visible; as the column narrows, actions collapse one-by-one into a "more" overflow menu. This standardizes the repeated pattern of title + hover action buttons seen in `VFolderNodes` and other table components.

## Problem Statement

Currently, table components like `VFolderNodes` implement the title + action buttons pattern manually:

- Hover state management via `onCell` + `onMouseEnter/onMouseLeave` + `useState` (causes React re-renders)
- Manual `Tooltip` wrapping for each action button
- Manual `BAIFlex` layout for button alignment
- No responsive overflow handling — action buttons overflow or get clipped when the column is narrow
- Separate "controls" column required, wasting horizontal space

This leads to code duplication, inconsistent UX, and no responsive behavior for action buttons.

## User Stories

- **As a developer**, I want a declarative component where I define actions as a config array (key, title, icon, onClick, type) and the component handles layout, tooltips, hover visibility, and responsive overflow automatically.
- **As a developer**, I want the title area to support navigation via `to` (React Router) or `onTitleClick`, with automatic ellipsis when space is limited.
- **As a user**, I want to see action buttons when I hover over a table row, without them taking up space when I'm not interacting.
- **As a user**, when the column is narrow, I want a "more" button that shows all available actions in a dropdown menu with icons and labels.

## Requirements

### Must Have

- [x] Reusable component (`BAINameActionCell`) placed in `packages/backend.ai-ui/src/components/Table/`
- [x] Title area with optional icon, text content, and navigation support (`to` or `onTitleClick`)
- [x] Title auto-ellipsis with tooltip on overflow (via `BAIText` / `BAILink`)
- [x] Actions defined as a config array with: `key`, `title`, `icon`, `onClick`, `action` (async), `type` (default/danger), `disabled`, `disabledReason`
- [x] CSS-only hover visibility (`opacity` + `pointer-events`) — no React state needed
- [x] Keyboard accessibility via `:focus-within`
- [x] ResizeObserver-based responsive overflow calculation with `requestAnimationFrame` debounce
- [x] Actions collapse right-to-left into a "more" (`MoreOutlined`) dropdown menu
- [x] Overflow menu shows all actions with icon + title (full discoverability)
- [x] `showActions` prop: `'hover'` (default) or `'always'`
- [x] `minVisibleActions` prop to guarantee minimum visible action count
- [x] Danger-type actions styled with error colors in both button and menu form
- [x] Disabled actions with `disabledReason` shown as tooltip
- [x] Async `action` prop using `useTransition` for automatic loading state (mirrors `BAIButton.action`)
- [x] Exported from `packages/backend.ai-ui/src/components/Table/index.ts`

### Nice to Have

- [ ] Integration example: migrate `VFolderNodes` name + controls columns into a single column using `BAINameActionCell`

## Component API

### BAINameActionCellAction

```typescript
interface BAINameActionCellAction {
  key: string;                        // Unique key for React rendering
  title: string;                      // Tooltip on buttons, text in menu
  icon?: React.ReactNode;             // Icon for both button and menu
  onClick?: () => void;               // Sync click handler
  action?: () => Promise<void>;       // Async handler with auto-loading (useTransition)
  type?: 'default' | 'danger';        // Visual style
  disabled?: boolean;                 // Disable the action
  disabledReason?: string;            // Tooltip when disabled
}
```

### BAINameActionCellProps

```typescript
interface BAINameActionCellProps {
  // Title area (left side)
  icon?: React.ReactNode;             // Icon before title
  title?: React.ReactNode;            // Title text or custom content
  to?: LinkProps['to'];               // React Router navigation
  onTitleClick?: (e: React.MouseEvent) => void;  // Title click handler

  // Actions area (right side)
  actions?: BAINameActionCellAction[]; // Action definitions

  // Behavior
  showActions?: 'hover' | 'always';   // Default: 'hover'
  minVisibleActions?: number;          // Default: 0

  // Styling
  style?: React.CSSProperties;
  className?: string;
}
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [icon]  Title text (ellipsis...)    [📝] [🔗] [🗑️] [...] │
│  ├── titleArea (flex: 1) ──────┤  ├── actionsArea ────┤ │
└─────────────────────────────────────────────────────────┘
```

- **titleArea**: `flex: 1, min-width: 0` — fills remaining space, ellipsis on overflow
- **actionsArea**: `flex-shrink: 0` — fixed width, shown on hover

## Behavior Details

### Hover Visibility (CSS-only)

- Default state: `opacity: 0` + `pointer-events: none`
- On `:hover` or `:focus-within`: `opacity: 1` + `pointer-events: auto`
- Transition: `opacity 0.15s ease`
- No React state management — zero re-renders for hover

### Responsive Overflow

- `ResizeObserver` monitors container width
- `requestAnimationFrame` debounces calculation to prevent infinite loops
- Actions collapse right-to-left (last action overflows first)
- When overflow occurs, a `MoreOutlined` button appears
- More menu contains **all** actions (not just overflowed), ensuring full discoverability

```
Wide:     [Edit] [Share] [Copy] [Delete]
Medium:   [Edit] [Share] [...]
Narrow:   [Edit] [...]
Minimum:  [...]
```

### Title Rendering

| Props provided       | Renders as   | Behavior                        |
|----------------------|--------------|----------------------------------|
| `to`                 | `BAILink`    | React Router link + ellipsis     |
| `onTitleClick`       | `BAILink`    | Clickable text + ellipsis        |
| Neither              | `BAIText`    | Plain text + tooltip on overflow |

### Action Rendering

| Context         | Icon button                      | Overflow menu item              |
|-----------------|----------------------------------|---------------------------------|
| Normal          | `BAIButton type="text" size="small"` + Tooltip | Icon + title text        |
| Danger          | `danger` prop on BAIButton       | `danger: true` on menu item     |
| Disabled        | `disabled` + `disabledReason` tooltip | `disabled` on menu item    |
| Async (`action`)| `BAIButton.action` (useTransition) | `startTransition` wrapper     |

## Implementation Details

### Key Dependencies

| Component  | Source                              | Usage                           |
|------------|-------------------------------------|---------------------------------|
| `BAIText`  | `../BAIText`                        | Ellipsis with ResizeObserver    |
| `BAILink`  | `../BAILink`                        | Navigation + ellipsis           |
| `BAIButton`| `../BAIButton`                      | Action buttons (async support)  |
| `Dropdown` | `antd`                              | Overflow menu                   |
| `Tooltip`  | `antd`                              | Action button labels            |
| `createStyles` | `antd-style`                    | CSS-in-JS (project convention)  |

### Performance

- CSS-only hover: zero React re-renders for show/hide
- `ResizeObserver` callback debounced via `requestAnimationFrame`
- Cleanup on unmount: `ro.disconnect()` + `cancelAnimationFrame(rafId)`
- `visibleCount` reset when `actions` array length changes
- `'use memo'` directive for React Compiler optimization

### Accessibility

- `:focus-within` ensures keyboard users can discover actions via Tab
- `aria-label="More actions"` on the overflow button
- antd `Dropdown` + `Menu` provides `role="menu"` and `role="menuitem"` automatically
- Disabled actions communicate reason via tooltip

## Storybook Stories

| Story              | Description                                        |
|--------------------|----------------------------------------------------|
| Basic              | Icon + title + 4 actions (edit, share, copy, delete)|
| WithNavigation     | `to` prop for React Router link                    |
| AlwaysShowActions  | `showActions: 'always'`                            |
| WithDisabledAction | Disabled action with `disabledReason`              |
| LongTitle          | Narrow container (300px), ellipsis behavior         |
| ResponsiveOverflow | Interactive slider to resize container              |
| TitleOnly          | No actions, title only                             |
| AsyncAction        | `action` prop with 2s delay, loading spinner        |

## Usage Example

```tsx
// VFolderNodes — replacing separate name + controls columns
{
  key: 'name',
  title: t('data.folders.Name'),
  render: (_name, vfolder) => (
    <BAINameActionCell
      icon={<VFolderNodeIdenticon vfolderNodeIdenticonFrgmt={vfolder} />}
      title={vfolder.name}
      to={generateFolderPath(toLocalId(vfolder?.id))}
      actions={[
        {
          key: 'share',
          title: t('button.Share'),
          icon: <BAIShareAltIcon />,
          onClick: () => setInviteFolderId(toLocalId(vfolder?.id)),
        },
        {
          key: 'delete',
          title: t('data.folders.MoveToTrash'),
          icon: <BAITrashBinIcon />,
          type: 'danger',
          onClick: () => handleDelete(vfolder),
        },
      ]}
    />
  ),
}
```

## File Manifest

| File | Action |
|------|--------|
| `packages/backend.ai-ui/src/components/Table/BAINameActionCell.tsx` | Created |
| `packages/backend.ai-ui/src/components/Table/BAINameActionCell.stories.tsx` | Created |
| `packages/backend.ai-ui/src/components/Table/index.ts` | Modified (export added) |
