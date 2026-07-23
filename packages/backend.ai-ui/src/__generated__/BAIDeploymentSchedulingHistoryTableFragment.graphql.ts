/**
 * @generated SignedSource<<f04a8d6c2c26a9be4969f98eb55bd6f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIDeploymentSchedulingHistoryTableFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryNodesFragment">;
  readonly " $fragmentType": "BAIDeploymentSchedulingHistoryTableFragment";
}>;
export type BAIDeploymentSchedulingHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIDeploymentSchedulingHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIDeploymentSchedulingHistoryTableFragment",
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
      "name": "BAIDeploymentSchedulingHistoryNodesFragment"
    }
  ],
  "type": "DeploymentHistory",
  "abstractKey": null
};

(node as any).hash = "72a9b8118e4f52a97c2ab8996996098d";

export default node;
