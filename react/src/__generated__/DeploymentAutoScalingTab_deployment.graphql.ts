/**
 * @generated SignedSource<<4359cd6f82b2b243fa3d16fca083dbc5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentAutoScalingTab_deployment$data = {
  readonly creator: {
    readonly basicInfo: {
      readonly email: string;
    };
  } | null | undefined;
  readonly id: string;
  readonly metadata: {
    readonly status: DeploymentStatus;
  };
  readonly " $fragmentType": "DeploymentAutoScalingTab_deployment";
};
export type DeploymentAutoScalingTab_deployment$key = {
  readonly " $data"?: DeploymentAutoScalingTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAutoScalingTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAutoScalingTab_deployment",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2",
      "kind": "LinkedField",
      "name": "creator",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2BasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "email",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "129d74dafb7ab8394c47065f3b9af25e";

export default node;
