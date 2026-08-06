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

 PILOT-DECISIONs:
 - `styles={{ header, body }}` has NO Astryx equivalent — the card owns one
   uniform `padding` step. The flush-to-header look and the project's
   `body.paddingTop: 0` convention are reproduced by composing the header
   inside the card's padding box; the prop is accepted-and-ignored so call
   sites keep compiling.
 - `variant="borderless"` maps to Astryx `variant="default"` (a real white/
   surface-coloured card), NOT `transparent`. Phase 2 mapped it to
   `transparent`, which is what made the converted page lose its card
   background entirely. antd's "borderless" means *no border*, not *no
   surface* — mapping it to `transparent` was a misreading.
 - `status` (success/error/warning border tint, used elsewhere in the app) is
   NOT implemented — Astryx exposes no border-colour prop, so it needs a theme
   component override. This page does not use it.
*/
import { Card } from '@astryxdesign/core/Card';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Heading } from '@astryxdesign/core/Text';
import React from 'react';

export interface BAICardAstryxTabItem {
  key: string;
  label: string;
  /** Trailing slot — badge counts, status dots. */
  endContent?: React.ReactNode;
}

export interface BAICardAstryxProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  variant?: 'borderless' | 'outlined';
  /** Tabs rendered at the bottom edge of the card header (antd parity). */
  tabList?: Array<BAICardAstryxTabItem>;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  /** Accepted and ignored — see the note above. */
  styles?: Record<string, React.CSSProperties>;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

const BAICardAstryx: React.FC<BAICardAstryxProps> = ({
  title,
  extra,
  tabList,
  activeTabKey,
  onTabChange,
  style,
  className,
  children,
}) => {
  'use memo';
  const hasHeader = !!title || !!extra || !!tabList?.length;
  return (
    <Card
      // A real surface — see the `variant` PILOT-DECISION above.
      variant="default"
      // antd's Card body padding is 24px (`token.paddingLG`) = Astryx step 6.
      padding={6}
      style={style}
      className={className}
    >
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
            {tabList?.length ? (
              // `hasDivider` puts the rail on the header's bottom edge, so the
              // body starts directly under the tab underline — the tabbed-card
              // behaviour the project convention describes.
              <TabList
                value={activeTabKey ?? tabList[0]?.key ?? ''}
                onChange={(key) => onTabChange?.(key)}
                hasDivider
              >
                {tabList.map((tab) => (
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
