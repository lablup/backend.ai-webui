/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAICard` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 FRONTIER COMPONENT — 142 call sites in 57 files, plus two components that
 declare `interface XProps extends BAICardProps` (`ConfigurableResourceCard`,
 `SessionOwnerSetterPreviewCard`). The public prop surface stays antd
 `Card`-SHAPED so none of them change; only the internals move to Astryx, and
 `CardProps` is replaced by a locally-declared interface so this module drops
 out of the antd import graph (P15).

 antd's `Card` is a container WITH a header contract; Astryx's `Card` is a bare
 surface (`variant`, `padding`, `elevation`, `width`, …). Everything else is
 composition (MAPPING §5.1), and this file follows the frame the pilot's
 `BAICardAstryx` already ratified:

     ┌─────────────────────────────────────────────┐
     │  Title                          {extra}     │  <- title row
     │  ──Tab A──  Tab B                           │  <- tabList, welded to the
     ├─────────────────────────────────────────────┤     header's bottom edge
     │  children                                   │  <- body
     └─────────────────────────────────────────────┘

   `title`               -> `Heading level={3}` (string) / verbatim (JSX)
   `extra`               -> right-aligned in the title row
   `size="small"`        -> `padding={3}` (12px, antd's small card padding);
                            otherwise `padding={6}` (24px, antd's default)
   `type="inner"`        -> `variant="muted"` (antd's inner card is the tinted,
                            nested one)
   `bordered={false}` /
   `variant="borderless"`-> Astryx `variant="default"`, NOT `"transparent"`
                            (MAPPING §9 correction 1 — antd "borderless" means
                            no border, not no background; reading it as
                            `transparent` is what made the pilot's phase-2/3
                            screenshots look wrong)
   `tabList`/`activeTabKey`/`onTabChange` -> `TabList hasDivider` + `Tab`
   `status`              -> a border tint from `BAICard.css` (tokens only)
   `hoverable`           -> a hover shadow from `BAICard.css`
   `loading`             -> `Skeleton` boxes in place of the body

 PILOT-DECISION — **`styles={{ header, body }}` is accepted and ignored.**
 34 call sites pass it and 30 of those are exactly
 `styles={{ body: { paddingTop: 0 } }}`, the `use-bai-card.md` convention that
 removes antd's body top padding so the body sits flush under the header.
 Astryx `Card` has ONE `padding` step for the whole surface: header and body
 live inside the same padded box, so the flush-body look is structural here and
 the override has nothing to remove — the same call the pilot's `BAICardAstryx`
 made ("`styles.body.paddingTop: 0` is a no-op"). The remaining four sites
 (`padding`/`paddingBottom` tweaks) lose a per-card padding nudge rather than
 double-padding the body; `padding` is the supported knob and `size="small"` is
 the supported step.

 PILOT-DECISION — **the header divider is a `Divider`, and `tabList` still
 implies one.** antd's `BAICard` hid `.ant-card-head`'s bottom border unless
 `showDivider` or `tabList` was set (the "flatter, cleaner look" of
 `use-bai-card.md`). Astryx `Card` draws no header rule at all, so the polarity
 inverts: nothing is drawn by default, and `showDivider` opts IN via an
 explicit `Divider`. `tabList` keeps its implicit divider through
 `TabList hasDivider`, which is where Astryx puts the rail's rule.

 PILOT-DECISION — **`title` becomes a real `<h3>`.** antd rendered the card
 title as a `<div>`; Astryx's `Heading` emits a heading element. This is the
 pilot's ratified choice for `BAICardAstryx` and it makes card titles
 navigable, but it DOES add headings to the document outline — worth knowing
 when auditing page heading structure. JSX titles (icon + text rows) are still
 rendered verbatim, so they are unaffected.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import BAIButton from './BAIButton';
import './BAICard.css';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Heading } from '@astryxdesign/core/Text';
import { CircleX, TriangleAlert } from 'lucide-react';
import React from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';

/** antd `Card`'s `tabList` item, restated locally. */
export interface BAICardTabItem {
  key: string;
  label?: ReactNode;
  /** antd's pre-v5 name for `label`; still passed by a few call sites. */
  tab?: ReactNode;
  /**
   * Trailing slot inside the tab (a count badge, a help tooltip icon).
   *
   * Astryx `Tab` is `label` (a required STRING that doubles as the accessible
   * name) plus `endContent`. A JSX `label` therefore has to be SPLIT, and only
   * the call site knows where the seam is — so it passes the extras here and
   * keeps `label` a plain string. See the render note below for what used to
   * happen when it did not.
   */
  endContent?: ReactNode;
  /**
   * Accepted and ignored: Astryx `Tab` has no disabled state. No call site in
   * the repo passes it, so nothing regresses — it stays in the type only so an
   * antd-shaped `tabList` literal keeps type-checking.
   */
  disabled?: boolean;
}

/**
 * antd `Card`'s `styles` slot map, restated locally. Accepted and ignored —
 * see the PILOT-DECISION above.
 */
export interface BAICardSlotStyles {
  header?: CSSProperties;
  body?: CSSProperties;
  cover?: CSSProperties;
  actions?: CSSProperties;
  extra?: CSSProperties;
  title?: CSSProperties;
}

export interface BAICardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'color' | 'children'
> {
  /** Visual status of the card affecting border color and extra button icons */
  status?: 'success' | 'error' | 'warning' | 'default';
  title?: ReactNode;
  /** Custom content to display in the header area */
  extra?: ReactNode;
  /** Title for the extra button that appears in the header */
  extraButtonTitle?: string | ReactNode;
  /** Show header divider. Automatically enabled when tabList is specified */
  showDivider?: boolean;
  /** Callback function triggered when the extra button is clicked */
  onClickExtraButton?: () => void;
  size?: 'default' | 'small';
  /** antd's nested/inner card treatment. */
  type?: 'inner';
  /** antd v5 `bordered` / antd v6 `variant` — both mean the same thing here. */
  bordered?: boolean;
  variant?: 'outlined' | 'borderless';
  hoverable?: boolean;
  loading?: boolean;
  cover?: ReactNode;
  actions?: Array<ReactNode>;
  tabList?: Array<BAICardTabItem>;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  onTabChange?: (key: string) => void;
  tabBarExtraContent?: ReactNode;
  /** Accepted and ignored — see the PILOT-DECISION above. */
  styles?: BAICardSlotStyles;
  children?: ReactNode;
  /** React ref for the card container */
  ref?: Ref<HTMLDivElement> | undefined;
  [key: `data-${string}`]: string | undefined;
}

const BAICard: React.FC<BAICardProps> = ({
  status = 'default',
  extraButtonTitle,
  onClickExtraButton,
  extra,
  title,
  size,
  type,
  bordered: _bordered,
  variant: _variant,
  hoverable,
  loading,
  cover,
  actions,
  tabList,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  tabBarExtraContent,
  showDivider,
  styles: _styles,
  className,
  children,
  ...cardProps
}) => {
  const extraNode =
    extra ||
    (extraButtonTitle ? (
      <BAIButton
        type="link"
        className={
          status === 'error'
            ? 'bai-card-extra--error'
            : status === 'warning'
              ? 'bai-card-extra--warning'
              : undefined
        }
        icon={
          status === 'error' ? (
            <CircleX size="1em" />
          ) : status === 'warning' ? (
            <TriangleAlert size="1em" />
          ) : undefined
        }
        onClick={onClickExtraButton}
      >
        {extraButtonTitle}
      </BAIButton>
    ) : undefined);

  const hasTitleRow = !!title || !!extraNode;
  const tabs = tabList ?? [];
  const activeTab = activeTabKey ?? defaultActiveTabKey ?? tabs[0]?.key ?? '';

  return (
    <Card
      {...cardProps}
      className={[
        'bai-card',
        status !== 'default' ? `bai-card--${status}` : '',
        // Kept verbatim: `.bai-card-error` is an existing hook the app styles
        // and asserts on, and dropping it would be a silent contract change.
        status === 'error' ? 'bai-card-error' : '',
        hoverable ? 'bai-card--hoverable' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      variant={type === 'inner' ? 'muted' : 'default'}
      padding={size === 'small' ? 3 : 6}
    >
      <VStack gap={4} align="stretch">
        {cover}
        {hasTitleRow ? (
          <HStack
            justify={title ? 'between' : 'end'}
            align="center"
            wrap="wrap"
            gap={2}
          >
            {typeof title === 'string' ? (
              <Heading level={3}>{title}</Heading>
            ) : (
              title
            )}
            {extraNode ? <HStack gap={2}>{extraNode}</HStack> : null}
          </HStack>
        ) : null}
        {tabs.length ? (
          <HStack justify="between" align="end" gap={2}>
            <TabList
              value={activeTab}
              onChange={(key) => onTabChange?.(key)}
              hasDivider
            >
              {tabs.map((tab) => {
                const rawLabel = tab.label ?? tab.tab;
                return (
                  <Tab
                    key={tab.key}
                    value={tab.key}
                    // `Tab.label` is a required STRING that doubles as the
                    // accessible name (P2), so a JSX tab label is flattened
                    // for the name.
                    //
                    // DEFECT FIXED (phase 3, wave 3): the trailing slot used to
                    // fall back to the WHOLE `rawLabel` node whenever the label
                    // was JSX. Since `label` already renders the flattened text,
                    // the text came out TWICE — measured on `SchedulerPage`,
                    // whose tab read "Fair Share Setting Fair Share Setting ⓘ".
                    // Only the call site knows where a rich label splits, so it
                    // now passes `endContent` explicitly and keeps `label` a
                    // string; there is no guess to get wrong.
                    label={nodeToAccessibleLabel(rawLabel)}
                    endContent={tab.endContent}
                  />
                );
              })}
            </TabList>
            {tabBarExtraContent}
          </HStack>
        ) : showDivider ? (
          <Divider />
        ) : null}
        {loading ? (
          <VStack gap={2} align="stretch">
            <Skeleton height={16} width="60%" />
            <Skeleton height={16} width="100%" index={1} />
            <Skeleton height={16} width="80%" index={2} />
          </VStack>
        ) : (
          children
        )}
        {actions?.length ? (
          <>
            <Divider />
            <HStack justify="around" align="center" gap={2}>
              {actions}
            </HStack>
          </>
        ) : null}
      </VStack>
    </Card>
  );
};

BAICard.displayName = 'BAICard';

export default BAICard;
