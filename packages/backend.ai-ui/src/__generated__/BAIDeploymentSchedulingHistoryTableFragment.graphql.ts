/**
 * @generated SignedSource<<6de6e00d9e0724d5e667d94b430b255f>>
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
    readonly __typename: "SubStepResultGQL";
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
      "name": "BAIDeploymentSchedulingHistoryNodesFragment"
    }
  ],
  "type": "DeploymentHistory",
  "abstractKey": null
};

(node as any).hash = "ffe28e31a678e83d5ff3959d90d04053";

export default node;
