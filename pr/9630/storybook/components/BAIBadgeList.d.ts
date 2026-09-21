import { BAIFlexProps } from './BAIFlex';
import { BadgeProps } from '@astryxdesign/core/Badge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
declare const BAIBadgeList: React.FC<BAIBadgeListProps>;
export default BAIBadgeList;
