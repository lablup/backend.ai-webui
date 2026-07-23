/**
 * @generated SignedSource<<62e9f5ee291e0755eee6a0c3ad8898e4>>
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
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "BAISubStepNodesFragment"
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

(node as any).hash = "7f5f32e6a4ea10ddfc54ff01c8b260b2";

export default node;
