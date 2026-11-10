import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type BAISessionTypeTokenV2Fragment$data = {
    readonly sessionType: SessionV2Type;
    readonly " $fragmentType": "BAISessionTypeTokenV2Fragment";
};
export type BAISessionTypeTokenV2Fragment$key = {
    readonly " $data"?: BAISessionTypeTokenV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTokenV2Fragment">;
};
declare const node: ReaderFragment;
export default node;
