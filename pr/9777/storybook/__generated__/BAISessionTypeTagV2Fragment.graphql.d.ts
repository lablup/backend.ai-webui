import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type BAISessionTypeTagV2Fragment$data = {
    readonly sessionType: SessionV2Type;
    readonly " $fragmentType": "BAISessionTypeTagV2Fragment";
};
export type BAISessionTypeTagV2Fragment$key = {
    readonly " $data"?: BAISessionTypeTagV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTagV2Fragment">;
};
declare const node: ReaderFragment;
export default node;
