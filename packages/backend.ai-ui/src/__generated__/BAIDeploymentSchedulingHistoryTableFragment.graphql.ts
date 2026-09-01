/**
 * @generated SignedSource<<e257031e6c51a22bec3ff54d78bd9dda>>
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
  readonly phase: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly step: string;
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
      "name": "BAIDeploymentSchedulingHistoryNodesFragment"
    }
  ],
  "type": "DeploymentHistory",
  "abstractKey": null
};

(node as any).hash = "79396228ec9d200868dba2c92535e4b0";

export default node;
