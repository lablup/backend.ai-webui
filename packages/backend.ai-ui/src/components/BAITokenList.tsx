/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 A bounded list of settled values: each inline item is an Astryx `Token`
 (ADR 0007); the overflow `+N` is a count.

 The `+N` overflow opens on HOVER in both variants (FR-3707): it is a read-only
 peek at the items that did not fit, so it should behave like a tooltip —
 appear on hover, leave when the pointer does. `trigger="click"` is still
 available for a caller that wants a latched popover.

 A click-triggered overflow always uses a `Link` trigger: Astryx `Popover`
 wires its handlers onto a `<button>` / `[role="button"]` in the trigger
 subtree, and `Token` / `Badge` without `onClick` are not one. `Link` without
 `href` renders a `<button>`, which also keeps the affordance keyboard-reachable.
*/
import BAIFlex from './BAIFlex';
import { Badge } from '@astryxdesign/core/Badge';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { Link } from '@astryxdesign/core/Link';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

export type BAITokenListItem = string | number;

export interface BAITokenListProps {
  items: ReadonlyArray<BAITokenListItem>;
  maxInline?: number;
  emptyText?: ReactNode;
  /**
   * Visual style of the list.
   * - `'token'` (default): the first `maxInline` items render as `Token`s
   *   and the `+N` overflow is a `Link`. Suited for interactive
   *   contexts (modals).
   * - `'text'`: the first `maxInline` items render as inline plain (nowrap)
   *   text and the `+N` overflow is a compact `Badge`. Suited for dense table
   *   cells.
   *
   * Both variants' popups list only the overflowed items — the inline items
   * are already on screen, so repeating them adds nothing.
   */
  variant?: 'token' | 'text';
  /**
   * How the overflow popup is triggered. Defaults to `'hover'` in both
   * variants; pass `'click'` for a popover that latches open.
   */
  trigger?: 'click' | 'hover';
}

const BAITokenList: React.FC<BAITokenListProps> = ({
  items,
  maxInline = 3,
  emptyText = '-',
  variant = 'token',
  trigger,
}) => {
  'use memo';

  const inlineItems = _.slice(items, 0, maxInline);
  const restItems = _.slice(items, maxInline);
  const restCount = restItems.length;
  const effectiveTrigger = trigger ?? 'hover';

  if (items.length === 0) {
    return <>{emptyText}</>;
  }

  const restItemsList = (
    <BAIFlex
      direction="column"
      align="start"
      style={{ maxHeight: 240, overflowY: 'auto' }}
    >
      {_.map(restItems, (item, index) => (
        <Text key={`${item}-${index}`}>{item}</Text>
      ))}
    </BAIFlex>
  );

  // Astryx `Popover` wires its handlers onto a `<button>` in the trigger
  // subtree, and `Link` without `href` renders exactly that — so the click
  // branch keeps the `Link` whatever the variant, while `text` keeps its count
  // badge on the hover branch.
  const overflowAffordance =
    variant === 'text' ? (
      // `Badge` is a bare <span>, and HoverCard's `focusTrigger="auto"` only
      // attaches to a naturally focusable element — without this the `+N` is
      // unreachable by keyboard.
      <Badge
        variant="neutral"
        label={`+${restCount}`}
        tabIndex={0}
        style={{ cursor: 'help' }}
      />
    ) : (
      <Link>+{restCount}</Link>
    );

  const overflowControl =
    effectiveTrigger === 'hover' ? (
      // `HoverCard`, not `Tooltip`: this project's theme pins `.astryx-tooltip`
      // to antd's `colorBgSpotlight`, i.e. DARK in both schemes, which is right
      // for a short label and wrong for a list of values. HoverCard is the same
      // hover/focus trigger on a `--color-background-surface` card.
      // `touchTrigger="tap"`: the default leaves a tap on a button to that
      // button, and the token-variant trigger IS a button with no action of its own, so
      // touch users could not open the list at all.
      <HoverCard content={restItemsList} touchTrigger="tap">
        {overflowAffordance}
      </HoverCard>
    ) : (
      <Popover
        label={`+${restCount}`}
        content={restItemsList}
        // Read-only overflow list: with no focusable content, Popover's
        // autofocus lands on its own sr-only close button and `:focus-within`
        // un-clips it into a visible pill (FR-3707). `role="none"` keeps the
        // ARIA honest — focus never enters, so `aria-modal` would lie.
        hasCloseButton={false}
        hasAutoFocus={false}
        role="none"
      >
        <Link>+{restCount}</Link>
      </Popover>
    );

  if (variant === 'text') {
    return (
      <BAIFlex gap="xxs" align="center" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item, index) => (
          <span key={`${item}-${index}`} style={{ whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
        {restCount > 0 && overflowControl}
      </BAIFlex>
    );
  }

  return (
    <span>
      <BAIFlex wrap="wrap" gap="xs" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item, index) => (
          <Token key={`${item}-${index}`} label={String(item)} />
        ))}
      </BAIFlex>
      {restCount > 0 && (
        <>
          &nbsp;
          {overflowControl}
        </>
      )}
    </span>
  );
};

export default BAITokenList;
