/**
 * @generated SignedSource<<48e172f5efc5efe9965f89a8f8bc3e5a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type WebMCPDeploymentTools_deployments$data = ReadonlyArray<{
  readonly currentRevision: {
    readonly modelMountConfig: {
      readonly vfolder: {
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly revisionNumber: number;
  } | null | undefined;
  readonly id: string;
  readonly metadata: {
    readonly createdAt: string;
    readonly name: string;
    readonly resourceGroupName: string;
    readonly status: DeploymentStatus;
    readonly updatedAt: string;
  };
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
    readonly openToPublic: boolean;
  };
  readonly replicaState: {
    readonly desiredReplicaCount: number;
  };
  readonly runningReplicas: {
    readonly count: number;
  } | null | undefined;
  readonly " $fragmentType": "WebMCPDeploymentTools_deployments";
}>;
export type WebMCPDeploymentTools_deployments$key = ReadonlyArray<{
  readonly " $data"?: WebMCPDeploymentTools_deployments$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPDeploymentTools_deployments">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPDeploymentTools_deployments",
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
        (v0/*: any*/),
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
          "name": "createdAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "updatedAt",
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
          "name": "endpointUrl",
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
    },
    {
      "alias": "runningReplicas",
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": {
            "status": {
              "equals": "RUNNING"
            }
          }
        }
      ],
      "concreteType": "ModelReplicaConnection",
      "kind": "LinkedField",
      "name": "replicas",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        }
      ],
      "storageKey": "replicas(filter:{\"status\":{\"equals\":\"RUNNING\"}})"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "currentRevision",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "revisionNumber",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ModelMountConfig",
          "kind": "LinkedField",
          "name": "modelMountConfig",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderNode",
              "kind": "LinkedField",
              "name": "vfolder",
              "plural": false,
              "selections": [
                (v0/*: any*/)
              ],
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
})();

(node as any).hash = "bb05bbcd519f8ea60c24f2249f929259";

export default node;
