import { BAIColumnsType, BAITableProps } from '..';
import { BAIUserResourcePolicyV2TableFragment$data, BAIUserResourcePolicyV2TableFragment$key } from '../__generated__/BAIUserResourcePolicyV2TableFragment.graphql';
export type UserResourcePolicyV2InList = NonNullable<BAIUserResourcePolicyV2TableFragment$data[number]>;
export declare const availableUserResourcePolicySorterValues: readonly ["name", "maxVfolderCount", "maxConcurrentLogins", "maxSessionCountPerModelSession", "maxQuotaScopeSize", "maxCustomizedImageCount", "createdAt", ...("-createdAt" | "-name" | "-maxVfolderCount" | "-maxConcurrentLogins" | "-maxSessionCountPerModelSession" | "-maxQuotaScopeSize" | "-maxCustomizedImageCount")[]];
export interface BAIUserResourcePolicyV2TableProps extends Omit<BAITableProps<UserResourcePolicyV2InList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    userResourcePoliciesFrgmt: BAIUserResourcePolicyV2TableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<UserResourcePolicyV2InList>) => BAIColumnsType<UserResourcePolicyV2InList>;
    onChangeOrder?: (order: (typeof availableUserResourcePolicySorterValues)[number] | null) => void;
}
declare const BAIUserResourcePolicyV2Table: ({ userResourcePoliciesFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIUserResourcePolicyV2TableProps) => import("react").JSX.Element;
export default BAIUserResourcePolicyV2Table;
