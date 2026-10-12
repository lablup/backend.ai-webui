import { BAIAgentTableFragment$data, BAIAgentTableFragment$key } from '../../__generated__/BAIAgentTableFragment.graphql';
import { BAIColumnType, BAITableProps } from '../Table';
export type AgentNodeInList = NonNullable<NonNullable<BAIAgentTableFragment$data>[number]>;
export declare const availableAgentSorterKeys: readonly ["first_contact", "scaling_group", "status", "schedulable"];
export declare const availableAgentSorterValues: readonly ["first_contact", "scaling_group", "status", "schedulable", ...("-status" | "-first_contact" | "-scaling_group" | "-schedulable")[]];
export interface BAIAgentTableProps extends Omit<BAITableProps<any>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    agentsFragment: BAIAgentTableFragment$key;
    onClickAgentName?: (agent: AgentNodeInList) => void;
    onChangeOrder?: (order: (typeof availableAgentSorterValues)[number] | undefined) => void;
    customizeColumns?: (baseColumns: BAIColumnType<AgentNodeInList>[]) => BAIColumnType<AgentNodeInList>[];
}
declare const BAIAgentTable: React.FC<BAIAgentTableProps>;
export default BAIAgentTable;
