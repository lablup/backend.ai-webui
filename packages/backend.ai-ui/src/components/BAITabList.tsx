/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAITabList` — Astryx `TabList` plus the two tab LOOKS the app needs
 (to-astryx QA2-A / item 2).

 Astryx ships exactly one tab appearance: an underlined strip (`Tab` draws a
 2px accent indicator on its bottom edge, `TabList hasDivider` draws the rail).
 antd shipped two — `type="line"` and `type="card"` — and Backend.AI used both:
 the legacy `BAITabs` wrapper hard-coded `type="card"` for the session / data /
 project list pages, while plain antd `Tabs` (line) carried the rest.

 This component restores that pair as a single `type` prop, so the two styles
 coexist. `'line'` is a pass-through; `'card'` adds one class and the paint
 lives in `BAITabList.css`, entirely in design tokens. See that file's header
 for WHY it is CSS and not a `defineTheme` variant, and for the antd metrics
 each declaration reproduces.

 Two composition rules this component bakes in, both of which the app kept
 getting wrong by hand:

 1. **The `<nav>` must be block-level.** Astryx's tab strip is
    `display: flex; max-width: 100%` with no `width`, so inside a flex ROW it
    hugs its tabs and the `hasDivider` rail stops at the last tab instead of
    spanning the bar (the antd rail — `.ant-tabs-nav::before` — always spanned
    it). Rendering `TabList` as a direct child of a stretch/blocked container
    is the whole fix; there is nothing to override.
 2. **Trailing actions go INSIDE the nav**, pushed over with
    `margin-inline-start: auto` — Astryx's own `TabListTabsWithActions` idiom
    (`astryx template TabListTabsWithActions`). Laying them out as a SIBLING of
    the nav is what forces rule 1 to be violated.
*/
import './BAITabList.css';
import { TabList, type TabListProps } from '@astryxdesign/core/TabList';
import React, { type ReactNode } from 'react';

export interface BAITabListProps extends Omit<TabListProps, 'ref'> {
  /**
   * antd `Tabs.type`.
   * - `'line'` (default) — Astryx's underlined strip.
   * - `'card'` — boxed, gutter-separated tabs sitting on an accent rail
   *   (legacy `BAITabs` / antd `type="card"`).
   */
  type?: 'line' | 'card';
  /**
   * antd's `tabBarExtraContent`. Rendered as the nav's trailing slot so the
   * rail still spans the whole bar underneath it.
   */
  tabBarExtraContent?: ReactNode;
}

const BAITabList: React.FC<BAITabListProps> = ({
  type = 'line',
  hasDivider = true,
  size,
  className,
  tabBarExtraContent,
  children,
  ...tabListProps
}) => {
  'use memo';
  const isCard = type === 'card';
  return (
    <TabList
      {...tabListProps}
      className={[isCard ? 'bai-tab-list--card' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      // antd's card tabs are `controlHeightLG` tall; `lg` is the Astryx
      // element-size step that matches. The line style keeps Astryx's default.
      size={size ?? (isCard ? 'lg' : 'md')}
      hasDivider={hasDivider}
    >
      {children}
      {tabBarExtraContent ? (
        <div className="bai-tab-list__extra">{tabBarExtraContent}</div>
      ) : null}
    </TabList>
  );
};

BAITabList.displayName = 'BAITabList';

export default BAITabList;
