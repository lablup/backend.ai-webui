import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIImageNodeSimpleTagFragment$data = {
    readonly architecture: string | null | undefined;
    readonly base_image_name: string | null | undefined;
    readonly labels: ReadonlyArray<{
        readonly key: string;
        readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly namespace: string | null | undefined;
    readonly registry: string | null | undefined;
    readonly tag: string | null | undefined;
    readonly tags: ReadonlyArray<{
        readonly key: string | null | undefined;
        readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly version: string | null | undefined;
    readonly " $fragmentType": "BAIImageNodeSimpleTagFragment";
};
export type BAIImageNodeSimpleTagFragment$key = {
    readonly " $data"?: BAIImageNodeSimpleTagFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagFragment">;
};
declare const node: ReaderFragment;
export default node;
