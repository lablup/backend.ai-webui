import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAISessionClusterModeFragment$data = {
    readonly cluster_mode: string | null | undefined;
    readonly cluster_size: number | null | undefined;
    readonly " $fragmentType": "BAISessionClusterModeFragment";
};
export type BAISessionClusterModeFragment$key = {
    readonly " $data"?: BAISessionClusterModeFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeFragment">;
};
declare const node: ReaderFragment;
export default node;
