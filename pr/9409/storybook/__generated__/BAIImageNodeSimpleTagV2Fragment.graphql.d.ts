import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIImageNodeSimpleTagV2Fragment$data = {
    readonly identity: {
        readonly architecture: string;
        readonly canonicalName: string;
        readonly namespace: string;
    };
    readonly metadata: {
        readonly labels: ReadonlyArray<{
            readonly key: string;
            readonly value: string;
        }>;
        readonly tags: ReadonlyArray<{
            readonly key: string;
            readonly value: string;
        }>;
    };
    readonly " $fragmentType": "BAIImageNodeSimpleTagV2Fragment";
};
export type BAIImageNodeSimpleTagV2Fragment$key = {
    readonly " $data"?: BAIImageNodeSimpleTagV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
};
declare const node: ReaderFragment;
export default node;
