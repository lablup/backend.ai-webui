/**
 * @generated SignedSource<<fab0436457253611a585c705dff3f5f6>>
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
  readonly phase: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly step: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
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
      "name": "phase",
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
          "name": "step",
          "storageKey": null
        },
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
      "name": "BAISchedulingHistoryNodesFragment"
    }
  ],
  "type": "SessionSchedulingHistory",
  "abstractKey": null
};

(node as any).hash = "e369227c362b363c91d9f366ac98634d";

export default node;
