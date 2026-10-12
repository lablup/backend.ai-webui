import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIDeploymentTagChips_metadata$data = {
    readonly tags: ReadonlyArray<string>;
    readonly " $fragmentType": "BAIDeploymentTagChips_metadata";
};
export type BAIDeploymentTagChips_metadata$key = {
    readonly " $data"?: BAIDeploymentTagChips_metadata$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
};
declare const node: ReaderFragment;
export default node;
