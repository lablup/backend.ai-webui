import { BAIAuditLogNodesFragment$data, BAIAuditLogNodesFragment$key } from '../../__generated__/BAIAuditLogNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export type AuditLogNodeInList = NonNullable<BAIAuditLogNodesFragment$data[number]>;
export declare const availableAuditLogSorterValues: readonly ["createdAt", "operation", "status", ...("-status" | "-createdAt" | "-operation")[]];
export interface BAIAuditLogNodesProps extends Omit<BAITableProps<AuditLogNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    auditLogFrgmt: BAIAuditLogNodesFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<AuditLogNodeInList>) => BAIColumnsType<AuditLogNodeInList>;
    onChangeOrder?: (order: (typeof availableAuditLogSorterValues)[number] | null) => void;
}
/**
 * BAIAuditLogNodes - The common audit log table view. Presentational table over
 * an `AuditLogV2` plural fragment, scoped to a single resource. Renders the
 * standardized column / status UX shared across the Session, VFolder, and Model
 * Deployment detail surfaces; filter, pagination, and query orchestration live
 * in the consuming surface.
 */
declare const BAIAuditLogNodes: ({ auditLogFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIAuditLogNodesProps) => import("react").JSX.Element;
export default BAIAuditLogNodes;
