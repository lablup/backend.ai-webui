import { BAIColumnsType, BAITableProps } from '..';
import { BAIAdminRetentionPolicyTableFragment$data, BAIAdminRetentionPolicyTableFragment$key } from '../__generated__/BAIAdminRetentionPolicyTableFragment.graphql';
export type RetentionPolicyInList = NonNullable<BAIAdminRetentionPolicyTableFragment$data[number]>;
export declare const availableRetentionPolicySorterValues: readonly ["category", "createdAt", "lastSweptAt", ...("-createdAt" | "-category" | "-lastSweptAt")[]];
export interface BAIAdminRetentionPolicyTableProps extends Omit<BAITableProps<RetentionPolicyInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    retentionPoliciesFrgmt: BAIAdminRetentionPolicyTableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<RetentionPolicyInList>) => BAIColumnsType<RetentionPolicyInList>;
    onChangeOrder?: (order: (typeof availableRetentionPolicySorterValues)[number] | null) => void;
}
declare const BAIAdminRetentionPolicyTable: ({ retentionPoliciesFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIAdminRetentionPolicyTableProps) => import("react").JSX.Element;
export default BAIAdminRetentionPolicyTable;
