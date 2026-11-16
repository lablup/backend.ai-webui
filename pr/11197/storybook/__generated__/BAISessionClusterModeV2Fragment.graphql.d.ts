import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type BAISessionClusterModeV2Fragment$data = {
    readonly clusterMode: ClusterMode;
    readonly clusterSize: number;
    readonly " $fragmentType": "BAISessionClusterModeV2Fragment";
};
export type BAISessionClusterModeV2Fragment$key = {
    readonly " $data"?: BAISessionClusterModeV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeV2Fragment">;
};
declare const node: ReaderFragment;
export default node;
