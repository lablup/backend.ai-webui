/**
 * @generated SignedSource<<68e064a6c8d5766d300761b82490c47d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIRouteSchedulingHistoryTableFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly __typename: "SubStepResultGQL";
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryNodeTableFragment">;
  readonly " $fragmentType": "BAIRouteSchedulingHistoryTableFragment";
}>;
export type BAIRouteSchedulingHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIRouteSchedulingHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIRouteSchedulingHistoryTableFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "result",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SubStepResultGQL",
      "kind": "LinkedField",
      "name": "subSteps",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIRouteSchedulingHistoryNodeTableFragment"
    }
  ],
  "type": "RouteHistory",
  "abstractKey": null
};

(node as any).hash = "ab9b09efc1873fb7a80627e29a965d63";

export default node;
