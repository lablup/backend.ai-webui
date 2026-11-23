import { BAITableProps, BAIColumnType } from '..';
import { BAIUserNodesFragment$data, BAIUserNodesFragment$key } from '../__generated__/BAIUserNodesFragment.graphql';
export type UserNodeInList = NonNullable<BAIUserNodesFragment$data[number]>;
export declare const availableUserSorterValues: readonly ["email", "username", "full_name", "role", "resource_policy", "domain_name", "sudo_session_enabled", "need_password_change", "totp_activated", "created_at", "modified_at", "status", ...("-role" | "-status" | "-email" | "-username" | "-full_name" | "-resource_policy" | "-domain_name" | "-sudo_session_enabled" | "-need_password_change" | "-totp_activated" | "-created_at" | "-modified_at")[]];
interface BAIUserNodesProps extends Omit<BAITableProps<UserNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    usersFrgmt: BAIUserNodesFragment$key;
    customizeColumns?: (baseColumns: BAIColumnType<UserNodeInList>[]) => BAIColumnType<UserNodeInList>[];
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableUserSorterValues)[number] | null) => void;
}
declare const BAIUserNodes: React.FC<BAIUserNodesProps>;
export default BAIUserNodes;
