/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Tab } from '@astryxdesign/core/TabList';
import { BAITabList } from 'backend.ai-ui';
import React, { useId } from 'react';

/**
 * antd-`Tabs`-shaped wrapper (`items`, `activeKey`, `onChange`) over
 * `BAITabList`, kept so its call sites did not change in the Astryx migration.
 * Defaults to `type="card"` because the legacy wrapper hard-coded it.
 *
 * Every call site switches a view in place, so the strip speaks the WAI-ARIA
 * tabs pattern (`tablist` / `tab` + `aria-selected`) rather than `navigation`.
 * The exception is a strip with `tabBarExtraContent`: a tablist may own only
 * tabs, so that strip stays a `navigation` landmark.
 */
export interface BAITabItem {
  key: string;
  /** Astryx `Tab.label` is also its accessible name — prefer a string. */
  label: React.ReactNode;
  /** Trailing slot — badge counts, status dots. Astryx-native. */
  endContent?: React.ReactNode;
  disabled?: boolean;
  /** The item's panel, rendered while it is active (Astryx renders none). */
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
   * `'card'` (default) draws boxed tabs on an accent rail; `'line'` draws
   * Astryx's underlined strip.
   */
  type?: 'line' | 'card';
  /** antd's trailing tab-bar slot; forwarded to `BAITabList`. */
  tabBarExtraContent?: React.ReactNode;
  /**
   * Id of the element the caller renders the active tab's content in, when
   * that content lives outside `BAITabs`. Spread
   * `baiTabPanelProps(panelId, activeKey)` on that element.
   */
  panelId?: string;
}

const tabIdOf = (panelId: string, key: string) => `${panelId}-tab-${key}`;

/** Props that make an external element the tab panel of a `BAITabs`. */
export const baiTabPanelProps = (panelId: string, activeKey: string) => ({
  id: panelId,
  role: 'tabpanel',
  'aria-labelledby': tabIdOf(panelId, activeKey),
});

const BAITabs: React.FC<BAITabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  size,
  type = 'card',
  tabBarExtraContent,
  panelId: externalPanelId,
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

  const generatedPanelId = useId();
  const panelId = externalPanelId ?? generatedPanelId;
  const isTabList = !tabBarExtraContent;
  const rendersOwnPanel = isTabList && !externalPanelId && activePanel != null;
  // `aria-controls` must point at an element that exists.
  const hasPanel = isTabList && (!!externalPanelId || rendersOwnPanel);

  return (
    <>
      <BAITabList
        type={type}
        className={className}
        size={size}
        role={isTabList ? 'tablist' : undefined}
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
            label={item.label as string}
            endContent={item.endContent}
            id={isTabList ? tabIdOf(panelId, item.key) : undefined}
            panelId={hasPanel ? panelId : undefined}
          />
        ))}
      </BAITabList>
      {rendersOwnPanel ? (
        <div {...baiTabPanelProps(panelId, currentKey ?? '')}>
          {activePanel}
        </div>
      ) : (
        activePanel
      )}
    </>
  );
};

export default BAITabs;
