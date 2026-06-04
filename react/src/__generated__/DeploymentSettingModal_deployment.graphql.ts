/**
 * @generated SignedSource<<29ebb62f9856ab8f41f005a4a7340a65>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentSettingModal_deployment$data = {
  readonly id: string;
  readonly metadata: {
    readonly name: string;
    readonly resourceGroupName: string;
    readonly tags: ReadonlyArray<string>;
  };
  readonly networkAccess: {
    readonly openToPublic: boolean;
  };
  readonly replicaState: {
    readonly desiredReplicaCount: number;
  };
  readonly " $fragmentType": "DeploymentSettingModal_deployment";
};
export type DeploymentSettingModal_deployment$key = {
  readonly " $data"?: DeploymentSettingModal_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentSettingModal_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentSettingModal_deployment",
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
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tags",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceGroupName",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelDeploymentNetworkAccess",
      "kind": "LinkedField",
      "name": "networkAccess",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "openToPublic",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ReplicaState",
      "kind": "LinkedField",
      "name": "replicaState",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "desiredReplicaCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "d459de37db23674264d897a90d0399e7";

export default node;
