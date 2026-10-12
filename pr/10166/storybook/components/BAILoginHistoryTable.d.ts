import { BAIColumnsType, BAITableProps } from '..';
import { BAILoginHistoryTableFragment$data, BAILoginHistoryTableFragment$key } from '../__generated__/BAILoginHistoryTableFragment.graphql';
export type LoginHistoryNodeInList = NonNullable<BAILoginHistoryTableFragment$data[number]>;
export declare const loginResultFilterOptions: {
    label: "SUCCESS" | "FAILED_INVALID_CREDENTIALS" | "FAILED_USER_INACTIVE" | "FAILED_BLOCKED" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "EVICTED" | "EXPIRED";
    value: "SUCCESS" | "FAILED_INVALID_CREDENTIALS" | "FAILED_USER_INACTIVE" | "FAILED_BLOCKED" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "EVICTED" | "EXPIRED";
}[];
export declare const availableLoginHistorySorterValues: readonly ["createdAt", "result", "domainName", ...("-domainName" | "-createdAt" | "-result")[]];
export interface BAILoginHistoryTableProps extends Omit<BAITableProps<LoginHistoryNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    loginHistoryFrgmt: BAILoginHistoryTableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<LoginHistoryNodeInList>) => BAIColumnsType<LoginHistoryNodeInList>;
    onChangeOrder?: (order: (typeof availableLoginHistorySorterValues)[number] | null) => void;
}
/**
 * BAILoginHistoryTable - Presentational table over a `LoginHistoryV2` plural
 * fragment. Renders every login-history column; filter, pagination, and query
 * orchestration live in the consuming surface via the `customizeColumns` prop.
 * Login history is read-only, so unlike `BAILoginSessionTable` it exposes no
 * row-level actions. Mirrors the `*Nodes` idiom (`BAILoginSessionTable`,
 * `SessionNodes`).
 */
declare const BAILoginHistoryTable: ({ loginHistoryFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAILoginHistoryTableProps) => import("react").JSX.Element;
export default BAILoginHistoryTable;
