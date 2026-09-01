import { BAIColumnsType, BAITableProps } from '..';
import { BAIKeypairResourcePolicyV2TableFragment$data, BAIKeypairResourcePolicyV2TableFragment$key } from '../__generated__/BAIKeypairResourcePolicyV2TableFragment.graphql';
export type KeypairResourcePolicyV2InList = NonNullable<BAIKeypairResourcePolicyV2TableFragment$data[number]>;
export declare const availableKeypairResourcePolicySorterValues: readonly ["name", "createdAt", "maxSessionLifetime", "maxConcurrentSessions", "maxContainersPerSession", "idleTimeout", "maxConcurrentSftpSessions", "maxPendingSessionCount", ...("-createdAt" | "-name" | "-maxSessionLifetime" | "-maxConcurrentSessions" | "-maxContainersPerSession" | "-idleTimeout" | "-maxConcurrentSftpSessions" | "-maxPendingSessionCount")[]];
export interface BAIKeypairResourcePolicyV2TableProps extends Omit<BAITableProps<KeypairResourcePolicyV2InList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    keypairResourcePoliciesFrgmt: BAIKeypairResourcePolicyV2TableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<KeypairResourcePolicyV2InList>) => BAIColumnsType<KeypairResourcePolicyV2InList>;
    onChangeOrder?: (order: (typeof availableKeypairResourcePolicySorterValues)[number] | null) => void;
}
declare const BAIKeypairResourcePolicyV2Table: ({ keypairResourcePoliciesFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIKeypairResourcePolicyV2TableProps) => import("react").JSX.Element;
export default BAIKeypairResourcePolicyV2Table;
