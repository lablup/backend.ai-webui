/**
 * @generated SignedSource<<c8bfcd5d65a2f88ba70ee6dbdf169ee5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentAccessTokensTab_deployment$data = {
  readonly id: string;
  readonly metadata: {
    readonly status: DeploymentStatus;
  };
  readonly " $fragmentType": "DeploymentAccessTokensTab_deployment";
};
export type DeploymentAccessTokensTab_deployment$key = {
  readonly " $data"?: DeploymentAccessTokensTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAccessTokensTab_deployment",
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

(node as any).hash = "1c51a30cf7b59b0cf8623a314b8025e7";

export default node;
