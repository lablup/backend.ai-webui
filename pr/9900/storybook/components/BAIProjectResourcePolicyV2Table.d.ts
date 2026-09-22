import { BAIColumnsType, BAITableProps } from '..';
import { BAIProjectResourcePolicyV2TableFragment$data, BAIProjectResourcePolicyV2TableFragment$key } from '../__generated__/BAIProjectResourcePolicyV2TableFragment.graphql';
export type ProjectResourcePolicyV2InList = NonNullable<BAIProjectResourcePolicyV2TableFragment$data[number]>;
export declare const availableProjectResourcePolicySorterValues: readonly ["name", "maxVfolderCount", "maxQuotaScopeSize", "maxNetworkCount", "createdAt", ...("-createdAt" | "-name" | "-maxVfolderCount" | "-maxQuotaScopeSize" | "-maxNetworkCount")[]];
export interface BAIProjectResourcePolicyV2TableProps extends Omit<BAITableProps<ProjectResourcePolicyV2InList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    projectResourcePoliciesFrgmt: BAIProjectResourcePolicyV2TableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<ProjectResourcePolicyV2InList>) => BAIColumnsType<ProjectResourcePolicyV2InList>;
    onChangeOrder?: (order: (typeof availableProjectResourcePolicySorterValues)[number] | null) => void;
}
declare const BAIProjectResourcePolicyV2Table: ({ projectResourcePoliciesFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIProjectResourcePolicyV2TableProps) => import("react").JSX.Element;
export default BAIProjectResourcePolicyV2Table;
