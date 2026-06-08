/**
 * @generated SignedSource<<5167fb0c976036ba2e6069b5630c48c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISchedulingHistoryNodesFragment$data = ReadonlyArray<{
  readonly attempts: number;
  readonly createdAt: string;
  readonly errorCode: string | null | undefined;
  readonly fromStatus: string | null | undefined;
  readonly id: string;
  readonly phase: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
  }>;
  readonly toStatus: string | null | undefined;
  readonly updatedAt: string;
  readonly " $fragmentType": "BAISchedulingHistoryNodesFragment";
}>;
export type BAISchedulingHistoryNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAISchedulingHistoryNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAISchedulingHistoryNodesFragment",
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
      "name": "attempts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fromStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "toStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "errorCode",
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "BAISubStepNodesFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SessionSchedulingHistory",
  "abstractKey": null
};

(node as any).hash = "c7940cc5ae473c5017d5f08dcdc815ef";

export default node;
