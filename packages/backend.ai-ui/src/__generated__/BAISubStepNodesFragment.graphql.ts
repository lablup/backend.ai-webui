/**
 * @generated SignedSource<<3863c621690587a7cacb0a84ac57a711>>
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
  "type": "SubStepResult",
  "abstractKey": null
};

(node as any).hash = "d08345bcb1a939d04f09280993b0f1ce";

export default node;
