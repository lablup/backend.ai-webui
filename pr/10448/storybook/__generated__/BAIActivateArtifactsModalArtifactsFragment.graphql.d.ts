import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIActivateArtifactsModalArtifactsFragment$data = ReadonlyArray<{
    readonly entityId: string;
    readonly id: string;
    readonly name: string;
    readonly " $fragmentType": "BAIActivateArtifactsModalArtifactsFragment";
}>;
export type BAIActivateArtifactsModalArtifactsFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIActivateArtifactsModalArtifactsFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment">;
}>;
declare const node: ReaderFragment;
export default node;
