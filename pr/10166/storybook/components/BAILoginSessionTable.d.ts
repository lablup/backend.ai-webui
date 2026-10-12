import { BAIColumnsType, BAITableProps } from '..';
import { BAILoginSessionTableFragment$data, BAILoginSessionTableFragment$key } from '../__generated__/BAILoginSessionTableFragment.graphql';
export type LoginSessionNodeInList = NonNullable<BAILoginSessionTableFragment$data[number]>;
export declare const availableLoginSessionSorterValues: readonly ["createdAt", ..."-createdAt"[]];
export interface BAILoginSessionTableProps extends Omit<BAITableProps<LoginSessionNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    loginSessionsFrgmt: BAILoginSessionTableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<LoginSessionNodeInList>) => BAIColumnsType<LoginSessionNodeInList>;
    onChangeOrder?: (order: (typeof availableLoginSessionSorterValues)[number] | null) => void;
}
/**
 * BAILoginSessionTable - Presentational table over a `LoginSessionV2` plural
 * fragment. Renders the user, access key, and created-at columns; filter,
 * pagination, and query orchestration (plus row-level actions such as revoke)
 * live in the consuming surface via the `customizeColumns` prop. Mirrors the
 * `*Nodes` idiom (`BAIAuditLogNodes`, `SessionNodes`).
 */
declare const BAILoginSessionTable: ({ loginSessionsFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAILoginSessionTableProps) => import("react").JSX.Element;
export default BAILoginSessionTable;
