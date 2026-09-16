/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { badgeVariantForTagColor } from '../helper/astryxTagVariant';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex, { type BAIFlexProps } from './BAIFlex';
import BAIText from './BAIText';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeProps } from '@astryxdesign/core/Badge';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAIBadgeListItem {
  key?: React.Key;
  label: string;
}

export interface BAIBadgeListProps extends Omit<BAIFlexProps, 'children'> {
  items: Array<BAIBadgeListItem>;
  /** How many badges are rendered before the overflow indicator. */
  maxCount?: number;
  /**
   * Size of the whole collection when `items` is only a page of it, as with a
   * connection capped by `first:`. Defaults to `items.length`.
   */
  totalCount?: number;
  variant?: BadgeProps['variant'];
  /** Rendered instead of the row when there is nothing to show. */
  emptyText?: React.ReactNode;
}

/**
 * A row of read-only badges that stops at `maxCount` and closes with an
 * "and N more" count, so one long-tailed record cannot stretch a table row.
 * Pass `totalCount` when the server returned only a page of the collection —
 * the indicator then reports what exists rather than what was fetched.
 */
const BAIBadgeList: React.FC<BAIBadgeListProps> = ({
  items,
  maxCount = 3,
  totalCount,
  variant,
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
        <Badge
          key={item.key ?? `${item.label}-${index}`}
          variant={variant ?? badgeVariantForTagColor(undefined)}
          label={item.label}
        />
      ))}
      {restCount > 0 ? (
        <BAIText type="secondary" size="sm">
          {t('comp:BAIBadgeList.AndMore', { rest: restCount })}
        </BAIText>
      ) : null}
    </BAIFlex>
  );
};

export default BAIBadgeList;
