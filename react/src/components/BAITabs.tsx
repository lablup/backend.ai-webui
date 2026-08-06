/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Tab, TabList } from '@astryxdesign/core/TabList';
import type { TabsProps } from 'antd';
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
 * 2. antd's `type="card"` visual (boxed tabs with a primary-coloured rail) has
 *    no Astryx counterpart. `hasDivider` is the nearest equivalent — an
 *    underlined tab strip. PILOT-DECISION: accepted the underline look rather
 *    than re-implementing card tabs; needs a design call.
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

export interface BAITabsProps extends Pick<
  TabsProps,
  'activeKey' | 'defaultActiveKey' | 'onChange' | 'className'
> {
  items?: Array<BAITabItem>;
  size?: 'sm' | 'md' | 'lg';
  /**
   * antd renders this at the trailing edge of the tab bar. Astryx's TabList
   * anatomy has a "Right Content" slot but exposes no prop for it, so the
   * wrapper lays it out with flexbox instead.
   */
  tabBarExtraContent?: React.ReactNode;
}

const BAITabs: React.FC<BAITabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  size = 'md',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TabList
          value={currentKey ?? ''}
          onChange={(value) => {
            if (!isControlled) setUncontrolledKey(value);
            onChange?.(value);
          }}
          size={size}
          hasDivider
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
        </TabList>
        {tabBarExtraContent ? (
          <div style={{ marginInlineStart: 'auto' }}>{tabBarExtraContent}</div>
        ) : null}
      </div>
      {activePanel}
    </>
  );
};

export default BAITabs;
