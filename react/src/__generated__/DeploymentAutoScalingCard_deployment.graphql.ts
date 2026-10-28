/**
 * @generated SignedSource<<34d72b03cc94ceec1e295202e5f35632>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentAutoScalingCard_deployment$data = {
  readonly creator: {
    readonly basicInfo: {
      readonly email: string;
    };
  } | null | undefined;
  readonly entityId: string;
  readonly id: string;
  readonly metadata: {
    readonly status: DeploymentStatus;
  };
  readonly " $fragmentType": "DeploymentAutoScalingCard_deployment";
};
export type DeploymentAutoScalingCard_deployment$key = {
  readonly " $data"?: DeploymentAutoScalingCard_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAutoScalingCard_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAutoScalingCard_deployment",
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
      "name": "entityId",
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

(node as any).hash = "192bda9a8f832f062b745048ddf0b807";

export default node;
