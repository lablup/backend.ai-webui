/**
 * @generated SignedSource<<9636fce98b1212f4b8a248e7493aa7cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIModelDeploymentNodesFragment$data = ReadonlyArray<{
  readonly currentRevisionId: string | null | undefined;
  readonly defaultDeploymentStrategy: {
    readonly type: DeploymentStrategyType;
  };
  readonly id: string;
  readonly metadata: {
    readonly createdAt: string;
    readonly domainName: string;
    readonly name: string;
    readonly projectId: string;
    readonly status: DeploymentStatus;
    readonly tags: ReadonlyArray<string>;
    readonly updatedAt: string;
  };
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
    readonly openToPublic: boolean;
    readonly preferredDomainName: string | null | undefined;
  };
  readonly replicaState: {
    readonly desiredReplicaCount: number;
  };
  readonly " $fragmentType": "BAIModelDeploymentNodesFragment";
}>;
export type BAIModelDeploymentNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIModelDeploymentNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIModelDeploymentNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIModelDeploymentNodesFragment",
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
      "name": "currentRevisionId",
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
          "name": "projectId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "domainName",
          "storageKey": null
        },
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
          "name": "status",
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
          "name": "createdAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "updatedAt",
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
          "name": "endpointUrl",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "preferredDomainName",
          "storageKey": null
        },
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
      "concreteType": "DeploymentStrategyGQL",
      "kind": "LinkedField",
      "name": "defaultDeploymentStrategy",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
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

(node as any).hash = "69b4f093cbd02868f78b114c388526eb";

export default node;
