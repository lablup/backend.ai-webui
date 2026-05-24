/**
 * @generated SignedSource<<8cf1e784b5e08d460a2ad081f8f9682d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISubStepNodesFragment$data = ReadonlyArray<{
  readonly endedAt: string | null | undefined;
  readonly errorCode: string | null | undefined;
  readonly message: string | null | undefined;
  readonly result: SchedulingResult;
  readonly startedAt: string | null | undefined;
  readonly step: string;
  readonly " $fragmentType": "BAISubStepNodesFragment";
}>;
export type BAISubStepNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAISubStepNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAISubStepNodesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "step",
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
      "kind": "ScalarField",
      "name": "errorCode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "message",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endedAt",
      "storageKey": null
    }
  ],
  "type": "SubStepResultGQL",
  "abstractKey": null
};

(node as any).hash = "b293ef89b3c67ebb0a3733e1c22f6df9";

export default node;
