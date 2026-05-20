/**
 * @generated SignedSource<<5238ebecce3df033c130da0e8d57e9dc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISessionHistorySubStepNodesFragment$data = ReadonlyArray<{
  readonly endedAt: string | null | undefined;
  readonly errorCode: string | null | undefined;
  readonly message: string | null | undefined;
  readonly result: SchedulingResult;
  readonly startedAt: string | null | undefined;
  readonly step: string;
  readonly " $fragmentType": "BAISessionHistorySubStepNodesFragment";
}>;
export type BAISessionHistorySubStepNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAISessionHistorySubStepNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionHistorySubStepNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAISessionHistorySubStepNodesFragment",
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

(node as any).hash = "60aa6030b046b74d04561f51bcacd545";

export default node;
