/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAITagList` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

   antd `Tag`             -> Astryx `Badge`   (MAPPING §3.5, not closable)
   antd `Typography.Text` -> Astryx `Text`
   antd `Typography.Link` -> Astryx `Link`
   antd `Tooltip`         -> Astryx `HoverCard` (a list of values needs a card
                             surface; `.astryx-tooltip` is dark in both schemes)
   antd `Popover`         -> Astryx `Popover` (`trigger="click"` is its only
                             trigger; hover overlays are `Tooltip`/`HoverCard`)

 The public prop surface (`items`, `maxInline`, `emptyText`, `variant`,
 `trigger`) is unchanged.

 The `+N` overflow opens on HOVER in both variants (FR-3707): it is a read-only
 peek at the items that did not fit, so it should behave like a tooltip —
 appear on hover, leave when the pointer does. `trigger="click"` is still
 available for a caller that wants a latched popover.

 A click-triggered overflow always uses a `Link` trigger: Astryx `Popover`
 wires its handlers onto a `<button>` / `[role="button"]` in the trigger
 subtree, and `Badge` is not one. `Link` without `href` renders a `<button>`,
 which is also what keeps the affordance keyboard-reachable on both branches —
 the antd chip was not.
*/
import BAIFlex from './BAIFlex';
import { Badge } from '@astryxdesign/core/Badge';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { Link } from '@astryxdesign/core/Link';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

export type BAITagListItem = string | number;

export interface BAITagListProps {
  items: ReadonlyArray<BAITagListItem>;
  maxInline?: number;
  emptyText?: ReactNode;
  /**
   * Visual style of the list.
   * - `'chip'` (default): the first `maxInline` items render as `Badge`
   *   chips and the `+N` overflow is a `Link`. Suited for interactive
   *   contexts (modals).
   * - `'text'`: the first `maxInline` items render as inline plain (nowrap)
   *   text and the `+N` overflow is a compact `Badge`. Suited for dense table
   *   cells.
   *
   * Both variants' popups list only the overflowed items — the inline items
   * are already on screen, so repeating them adds nothing.
   */
  variant?: 'chip' | 'text';
  /**
   * How the overflow popup is triggered. Defaults to `'hover'` in both
   * variants; pass `'click'` for a popover that latches open.
   */
  trigger?: 'click' | 'hover';
}

const BAITagList: React.FC<BAITagListProps> = ({
  items,
  maxInline = 3,
  emptyText = '-',
  variant = 'chip',
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
  // branch keeps the `Link` whatever the variant, while `text` keeps its chip
  // on the hover branch.
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
      // button, and the chip trigger IS a button with no action of its own, so
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
          <Badge key={`${item}-${index}`} variant="neutral" label={item} />
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

export default BAITagList;
