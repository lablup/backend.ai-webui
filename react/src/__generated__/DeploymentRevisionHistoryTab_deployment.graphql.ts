/**
 * @generated SignedSource<<8c20d1b2db8a649b29ae2a86f9cb4cb7>>
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
    readonly projectId: string;
    readonly status: DeploymentStatus;
  };
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_deployment">;
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeploymentAddRevisionModal_deployment"
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "a1e5f132d3a4459291ec51c9c42471b4";

export default node;
