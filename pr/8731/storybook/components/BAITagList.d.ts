import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
declare const BAITagList: React.FC<BAITagListProps>;
export default BAITagList;
