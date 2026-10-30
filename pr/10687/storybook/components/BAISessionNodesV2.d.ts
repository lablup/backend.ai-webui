import { BAIColumnType, BAITableProps, BAIEntityLabel } from '..';
import { BAISessionNodesV2Fragment$data, BAISessionNodesV2Fragment$key, SessionV2Status } from '../__generated__/BAISessionNodesV2Fragment.graphql';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type SessionV2InList = NonNullable<BAISessionNodesV2Fragment$data[number]>;
export type { SessionV2Status };
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
    /** Adds "Edit labels" to the Labels column's hover actions. */
    onEditLabels?: (session: SessionV2InList) => void;
    onLabelClick?: (label: BAIEntityLabel) => void;
    /** Shows the Labels column at the start; otherwise it starts hidden, revealed from the column settings. */
    showLabelsByDefault?: boolean;
}
declare const BAISessionNodesV2: React.FC<BAISessionNodesV2Props>;
export default BAISessionNodesV2;
