/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Tab } from '@astryxdesign/core/TabList';
import { BAITabList } from 'backend.ai-ui';
import React from 'react';

/**
 * PILOT (cn-oss-removal / ticket 10) — rebuilt on Astryx `TabList`/`Tab`.
 *
 * The PUBLIC prop contract is deliberately kept antd-shaped (`items`,
 * `activeKey`, `onChange`) so the 6 call sites in `react/src` do not change.
 * This "wrapper absorbs the API delta" strategy is what keeps the migration's
 * blast radius at the wrapper rather than at every consumer.
 *
 * Two deltas the wrapper cannot fully absorb:
 *
 * 1. Astryx `Tab.label` is typed `string` and is used BOTH as the visible text
 *    and as `aria-label`. antd's `items[].label` is a `ReactNode`, and 5 of the
 *    6 call sites pass JSX. Passing JSX renders correctly (Astryx puts `label`
 *    in a `<span>`) but poisons `aria-label` with `[object Object]`.
 *    -> `endContent` is added to the item shape so call sites CAN split
 *       "string label" from "trailing badge", which is the correct fix.
 *       `AdminVFolderNodeListPage` does exactly that; the rest still pass JSX.
 * PHASE 3 (wave 2 A): the antd `TabsProps` TYPE import is gone. §6 of the
 * mapping counts a type-only antd import as an antd import, so the four props
 * this file borrowed from it (`activeKey`, `defaultActiveKey`, `onChange`,
 * `className`) are restated below. The public contract is unchanged.
 *
 * 2. antd's `type="card"` visual (boxed tabs with a primary-coloured rail) has
 *    no Astryx counterpart.
 *    QA2-A: the earlier decision ("accepted the underline look; needs a design
 *    call") was overturned — the design call came back as "restore it". The
 *    card style now lives in BUI as `BAITabList type="card"` (see
 *    `packages/backend.ai-ui/src/components/BAITabList.css` for the mechanism
 *    and the antd metrics it reproduces). It is the DEFAULT here because
 *    legacy `BAITabs` hard-coded `type="card"`, so every wrapper call site was
 *    a card-tab site. Pass `type="line"` for the underlined strip; the two
 *    coexist, which is what `FolderExplorerModalV2` needs (card at `xl`, line
 *    below) and what `DownloadModal` needs (it was a plain antd `Tabs`).
 *
 * `tabBarExtraContent` and the full-width rail are `BAITabList`'s job now —
 * this wrapper only translates antd's `items` array into `Tab` children and
 * renders the active item's panel.
 */
export interface BAITabItem {
  key: string;
  label: React.ReactNode;
  /** Trailing slot — badge counts, status dots. Astryx-native. */
  endContent?: React.ReactNode;
  disabled?: boolean;
  /**
   * antd's `Tabs` renders the active item's `children` as its panel. Astryx's
   * `TabList` is navigation-ONLY and renders no panel at all — a genuine
   * capability gap. The wrapper closes it by rendering the active item's
   * `children` itself, so `StartFromURLModal` (the one call site that relies
   * on panels) keeps working unchanged.
   */
  children?: React.ReactNode;
}

export interface BAITabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  className?: string;
  items?: Array<BAITabItem>;
  size?: 'sm' | 'md' | 'lg';
  /**
   * antd `Tabs.type`. `'card'` (the default, matching legacy `BAITabs`) draws
   * the boxed, gutter-separated tabs sitting on an accent rail; `'line'` draws
   * Astryx's underlined strip.
   */
  type?: 'line' | 'card';
  /** antd's trailing tab-bar slot; forwarded to `BAITabList`. */
  tabBarExtraContent?: React.ReactNode;
}

const BAITabs: React.FC<BAITabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  size,
  type = 'card',
  tabBarExtraContent,
}) => {
  'use memo';
  // antd supports BOTH controlled (`activeKey`) and uncontrolled
  // (`defaultActiveKey`) usage; Astryx's TabList is controlled-only.
  const [uncontrolledKey, setUncontrolledKey] = React.useState(
    defaultActiveKey ?? items?.[0]?.key ?? '',
  );
  const isControlled = activeKey !== undefined;
  const currentKey = isControlled ? activeKey : uncontrolledKey;
  const activePanel = items?.find((item) => item.key === currentKey)?.children;

  return (
    <>
      <BAITabList
        type={type}
        className={className}
        size={size}
        value={currentKey ?? ''}
        onChange={(value) => {
          if (!isControlled) setUncontrolledKey(value);
          onChange?.(value);
        }}
        tabBarExtraContent={tabBarExtraContent}
      >
        {items?.map((item) => (
          <Tab
            key={item.key}
            value={item.key}
            // See note 1 above: ReactNode labels still render, typed string.
            label={item.label as string}
            endContent={item.endContent}
          />
        ))}
      </BAITabList>
      {activePanel}
    </>
  );
};

export default BAITabs;
