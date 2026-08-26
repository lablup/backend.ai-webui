/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAITagList` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

   antd `Tag`             -> Astryx `Badge`   (MAPPING §3.5, not closable)
   antd `Typography.Text` -> Astryx `Text`
   antd `Typography.Link` -> Astryx `Link`
   antd `Tooltip`         -> Astryx `Tooltip` (`title` -> `content`)
   antd `Popover`         -> Astryx `Popover` (`trigger="click"` is its only
                             trigger; hover overlays are `Tooltip`/`HoverCard`)

 The public prop surface (`items`, `maxInline`, `emptyText`, `variant`,
 `trigger`) is unchanged.

 PILOT-DECISION — **a click-triggered overflow always uses a `Link` trigger,
 in both variants.** Astryx `Popover` requires its trigger subtree to contain a
 `<button>` or `[role="button"]` — it wires the click/keydown handlers and the
 `aria-haspopup`/`aria-expanded`/`aria-controls` triple onto that element. A
 `Badge` is not one, so the `text` variant's click branch (which wrapped a
 chip) now renders the same `+N` affordance the `chip` variant already used.
 The default for `text` is `hover`, which keeps its `Badge`-in-a-`Tooltip`
 shape, so no default rendering changes. What is GAINED is that the click
 affordance is now keyboard-reachable — the antd chip was not.
*/
import BAIFlex from './BAIFlex';
import { Badge } from '@astryxdesign/core/Badge';
import { Link } from '@astryxdesign/core/Link';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
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
   *   chips and the `+N` overflow opens a `Popover`. Suited for interactive
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
   * How the overflow popup is triggered. Defaults to `'click'` for the `chip`
   * variant and `'hover'` for the `text` variant.
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
  const effectiveTrigger = trigger ?? (variant === 'text' ? 'hover' : 'click');

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

  const overflowControl =
    effectiveTrigger === 'hover' ? (
      <Tooltip content={restItemsList}>
        <Badge
          variant="neutral"
          label={`+${restCount}`}
          style={{ cursor: 'help' }}
        />
      </Tooltip>
    ) : (
      <Popover
        label={`+${restCount}`}
        content={restItemsList}
        // Read-only overflow list: with no focusable content, Popover's
        // autofocus lands on its own sr-only close button and `:focus-within`
        // un-clips it into a visible pill (FR-3707).
        hasCloseButton={false}
        hasAutoFocus={false}
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
