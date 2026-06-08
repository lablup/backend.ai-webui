/**
 * @generated SignedSource<<93ef287f4ac490eefb3020c463afabd7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISchedulingHistoryTableFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly __typename: "SubStepResultGQL";
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
  readonly " $fragmentType": "BAISchedulingHistoryTableFragment";
}>;
export type BAISchedulingHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAISchedulingHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAISchedulingHistoryTableFragment",
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
      "name": "BAISchedulingHistoryNodesFragment"
    }
  ],
  "type": "SessionSchedulingHistory",
  "abstractKey": null
};

(node as any).hash = "f6a91539248aaf046413a9a1dd4474eb";

export default node;
