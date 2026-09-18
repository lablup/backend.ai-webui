/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import type { AstryxTokenColor } from '../helper/astryxTagVariant';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex, { type BAIFlexProps } from './BAIFlex';
import BAIText from './BAIText';
import { Token } from '@astryxdesign/core/Token';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAITokenRowItem {
  key?: React.Key;
  label: string;
}

export interface BAITokenRowProps extends Omit<BAIFlexProps, 'children'> {
  items: Array<BAITokenRowItem>;
  /** How many tokens are rendered before the overflow indicator. */
  maxCount?: number;
  /**
   * Size of the whole collection when `items` is only a page of it, as with a
   * connection capped by `first:`. Defaults to `items.length`.
   */
  totalCount?: number;
  color?: AstryxTokenColor;
  /** Rendered instead of the row when there is nothing to show. */
  emptyText?: React.ReactNode;
}

/**
 * A row of read-only tokens that stops at `maxCount` and closes with an
 * "and N more" count, so one long-tailed record cannot stretch a table row.
 * Pass `totalCount` when the server returned only a page of the collection —
 * the indicator then reports what exists rather than what was fetched.
 */
const BAITokenRow: React.FC<BAITokenRowProps> = ({
  items,
  maxCount = 3,
  totalCount,
  color,
  emptyText = '-',
  direction = 'row',
  gap = 'xxs',
  wrap = 'wrap',
  ...flexProps
}) => {
  'use memo';
  const { t } = useBAIi18n();

  const visibleItems = _.take(items, maxCount);
  const restCount = Math.max(
    (totalCount ?? items.length) - visibleItems.length,
    0,
  );

  if (_.isEmpty(visibleItems)) {
    return <>{emptyText}</>;
  }

  return (
    <BAIFlex direction={direction} gap={gap} wrap={wrap} {...flexProps}>
      {_.map(visibleItems, (item, index) => (
        <Token
          key={item.key ?? `${item.label}-${index}`}
          color={color}
          label={item.label}
        />
      ))}
      {restCount > 0 ? (
        <BAIText type="secondary" size="sm">
          {t('comp:BAITokenRow.AndMore', { rest: restCount })}
        </BAIText>
      ) : null}
    </BAIFlex>
  );
};

export default BAITokenRow;
