import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAISessionAgentIdsFragment$data = {
    readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly " $fragmentType": "BAISessionAgentIdsFragment";
};
export type BAISessionAgentIdsFragment$key = {
    readonly " $data"?: BAISessionAgentIdsFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionAgentIdsFragment">;
};
declare const node: ReaderFragment;
export default node;
