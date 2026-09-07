import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIAgentTableFragment$data = ReadonlyArray<{
    readonly addr: string | null | undefined;
    readonly architecture: string | null | undefined;
    readonly available_slots: string | null | undefined;
    readonly compute_plugins: string | null | undefined;
    readonly first_contact: string | null | undefined;
    readonly id: string;
    readonly live_stat: string | null | undefined;
    readonly occupied_slots: string | null | undefined;
    readonly region: string | null | undefined;
    readonly row_id: string | null | undefined;
    readonly scaling_group: string | null | undefined;
    readonly schedulable: boolean | null | undefined;
    readonly status: string | null | undefined;
    readonly version: string | null | undefined;
    readonly " $fragmentType": "BAIAgentTableFragment";
}>;
export type BAIAgentTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIAgentTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAgentTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
