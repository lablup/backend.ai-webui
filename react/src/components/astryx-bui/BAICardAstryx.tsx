/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2/4 (cn-oss-removal / ticket 10) — local Astryx-backed `BAICard`.

 antd's `Card` is a container WITH a header contract (`title`, `extra`,
 `tabList`/`activeTabKey`/`onTabChange`, `styles.header` / `styles.body`,
 `variant="borderless"`). Astryx's `Card` is a bare surface — background
 variant, padding, elevation, and nothing else. The whole header, including the
 tab strip, is composed here.

 PHASE 4 rebuilt the frame to match the original page anatomy:

     ┌───────────────────────────────────────────────┐
     │  Folders                    [⟳ 30s ▾] [+ New] │  <- title row + `extra`
     │  ──Active(12)──  Trash Bin                    │  <- tabs on the header's
     ├───────────────────────────────────────────────┤     bottom edge
     │  filters / table / pagination                 │  <- body
     └───────────────────────────────────────────────┘

 PHASE 5 — props now **extend Astryx `CardProps`**, not antd's `CardProps`.
 The antd-shaped surface is gone entirely:

   REMOVED  `variant="borderless" | "outlined"`  -> Astryx `variant` passes through
   REMOVED  `styles={{ header, body }}`          -> Astryx has one `padding` step
   RENAMED  `tabList` -> `tabs`                  -> avoids antd's vocabulary
   RENAMED  `activeTabKey` -> `activeTab`
   RENAMED  `onTabChange` -> `onChangeTab`

 What the component still adds over a bare `Card` (and why it survives the
 "use Astryx directly" audit): the header composition itself — title row +
 right-aligned `extra` actions + a tab rail welded to the header's bottom edge,
 which is the `use-bai-card.md` convention and is ~40 lines of layout every
 call site would otherwise repeat.

 NOT implemented: `status` (success/error/warning border tint used elsewhere in
 the app). Astryx exposes no border-colour prop, so it needs a theme component
 override. This page does not use it.
*/
import { Card } from '@astryxdesign/core/Card';
import type { CardProps } from '@astryxdesign/core/Card';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Heading } from '@astryxdesign/core/Text';
import React from 'react';

export interface BAICardAstryxTab {
  key: string;
  /** Astryx `Tab` labels are strings and double as the accessible name. */
  label: string;
  /** Trailing slot — badge counts, status dots. */
  endContent?: React.ReactNode;
}

export interface BAICardAstryxProps extends CardProps {
  /** Rendered as a `Heading` when a string; otherwise used verbatim. */
  title?: React.ReactNode;
  /** Card-scoped actions, right-aligned in the header. */
  extra?: React.ReactNode;
  /** Tabs welded to the header's bottom edge. */
  tabs?: Array<BAICardAstryxTab>;
  activeTab?: string;
  onChangeTab?: (key: string) => void;
}

const BAICardAstryx: React.FC<BAICardAstryxProps> = ({
  title,
  extra,
  tabs,
  activeTab,
  onChangeTab,
  variant = 'default',
  padding = 6,
  children,
  ...cardProps
}) => {
  'use memo';
  const hasHeader = !!title || !!extra || !!tabs?.length;
  return (
    // `variant` and `padding` are Astryx's own props with Astryx defaults
    // (step 6 = 24px, matching the density the app already uses); everything
    // else passes straight through.
    <Card variant={variant} padding={padding} {...cardProps}>
      <VStack gap={4} align="stretch">
        {hasHeader ? (
          <VStack gap={4} align="stretch">
            {title || extra ? (
              <HStack justify="between" align="center" wrap="wrap" gap={2}>
                {typeof title === 'string' ? (
                  <Heading level={3}>{title}</Heading>
                ) : (
                  title
                )}
                {/* Card-scoped actions, right-aligned — the antd `extra` slot
                    and the placement `.claude/rules/use-bai-card.md` mandates. */}
                {extra}
              </HStack>
            ) : null}
            {tabs?.length ? (
              // `hasDivider` puts the rail on the header's bottom edge, so the
              // body starts directly under the tab underline — the tabbed-card
              // behaviour the project convention describes.
              <TabList
                value={activeTab ?? tabs[0]?.key ?? ''}
                onChange={(key) => onChangeTab?.(key)}
                hasDivider
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    value={tab.key}
                    label={tab.label}
                    endContent={tab.endContent}
                  />
                ))}
              </TabList>
            ) : null}
          </VStack>
        ) : null}
        {children}
      </VStack>
    </Card>
  );
};

export default BAICardAstryx;
