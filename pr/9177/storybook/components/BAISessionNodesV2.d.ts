import { BAIColumnType, BAITableProps } from '..';
import { BAISessionNodesV2Fragment$data, BAISessionNodesV2Fragment$key } from '../__generated__/BAISessionNodesV2Fragment.graphql';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type SessionV2InList = NonNullable<BAISessionNodesV2Fragment$data[number]>;
export declare const availableSessionV2SorterValues: readonly ["name", "status", "createdAt", "terminatedAt", "id", ...("-status" | "-createdAt" | "-id" | "-name" | "-terminatedAt")[]];
interface BAISessionNodesV2Props extends Omit<BAITableProps<SessionV2InList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    sessionsFrgmt: BAISessionNodesV2Fragment$key;
    /**
     * Hook to customize/override the generated columns. The `name` column is
     * rendered as a plain string by default; consumers use this to add a name
     * link / `BAINameActionCell` with row actions (e.g. terminate), or to swap
     * in app-only renderers.
     */
    customizeColumns?: (baseColumns: BAIColumnType<SessionV2InList>[]) => BAIColumnType<SessionV2InList>[];
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableSessionV2SorterValues)[number] | null) => void;
}
declare const BAISessionNodesV2: React.FC<BAISessionNodesV2Props>;
export default BAISessionNodesV2;
