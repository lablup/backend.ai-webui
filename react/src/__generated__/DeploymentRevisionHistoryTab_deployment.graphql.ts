/**
 * @generated SignedSource<<78409fe23ad9e090c8eeeea959eb93eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionHistoryTab_deployment$data = {
  readonly id: string;
  readonly metadata: {
    readonly status: DeploymentStatus;
  };
  readonly " $fragmentType": "DeploymentRevisionHistoryTab_deployment";
};
export type DeploymentRevisionHistoryTab_deployment$key = {
  readonly " $data"?: DeploymentRevisionHistoryTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionHistoryTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentRevisionHistoryTab_deployment",
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
      "concreteType": "ModelDeploymentMetadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "aacec4b1b75fc6fab4a24a0ee2952cee";

export default node;
