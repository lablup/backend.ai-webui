import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIDeploymentTagTokens_metadata$data = {
    readonly tags: ReadonlyArray<string>;
    readonly " $fragmentType": "BAIDeploymentTagTokens_metadata";
};
export type BAIDeploymentTagTokens_metadata$key = {
    readonly " $data"?: BAIDeploymentTagTokens_metadata$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagTokens_metadata">;
};
declare const node: ReaderFragment;
export default node;
