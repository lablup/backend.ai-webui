/**
 * @generated SignedSource<<a0f1cc240d45989a183f60009df09663>>
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
  readonly fromStatus: string | null | undefined;
  readonly id: string;
  readonly message: string | null | undefined;
  readonly phase: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly result: SchedulingResult;
    readonly step: string;
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

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
};
return {
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
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "phase",
      "storageKey": null
    },
    (v1/*: any*/),
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "step",
          "storageKey": null
        },
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "errorCode",
          "storageKey": null
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "SessionSchedulingHistory",
  "abstractKey": null
};
})();

(node as any).hash = "9d5ee56dba146dbb8458478a7a309c7f";

export default node;
