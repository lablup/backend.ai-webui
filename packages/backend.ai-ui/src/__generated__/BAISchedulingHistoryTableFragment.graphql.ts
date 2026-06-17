/**
 * @generated SignedSource<<78437bb97e2f6f7f9ff2eadc98f408cd>>
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
      "name": "BAISchedulingHistoryNodesFragment"
    }
  ],
  "type": "SessionSchedulingHistory",
  "abstractKey": null
};

(node as any).hash = "cc812aab73e7155ba3bc061806f997dd";

export default node;
