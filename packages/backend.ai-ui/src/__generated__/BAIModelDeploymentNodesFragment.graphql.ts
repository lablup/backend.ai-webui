/**
 * @generated SignedSource<<660395b15bde0b90d7faccf5f04d0b1e>>
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
  readonly currentRevision: {
    readonly id: string;
    readonly modelMountConfig: {
      readonly vfolder: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly revisionNumber: number;
  } | null | undefined;
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
    readonly projectV2: {
      readonly basicInfo: {
        readonly name: string;
      };
      readonly id: string;
    } | null | undefined;
    readonly resourceGroupName: string;
    readonly status: DeploymentStatus;
    readonly tags: ReadonlyArray<string>;
    readonly updatedAt: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
  };
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
    readonly openToPublic: boolean;
    readonly preferredDomainName: string | null | undefined;
  };
  readonly replicaState: {
    readonly desiredReplicaCount: number;
  };
  readonly runningReplicas: {
    readonly count: number;
  } | null | undefined;
  readonly totalReplicas: {
    readonly count: number;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentOwnerInfo_deployment">;
  readonly " $fragmentType": "BAIModelDeploymentNodesFragment";
}>;
export type BAIModelDeploymentNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIModelDeploymentNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIModelDeploymentNodesFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIModelDeploymentNodesFragment",
  "selections": [
    (v0/*: any*/),
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
        (v1/*: any*/),
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceGroupName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "projectV2",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                (v1/*: any*/)
              ],
              "storageKey": null
            },
            (v0/*: any*/)
          ],
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "BAIDeploymentTagChips_metadata"
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
      "concreteType": "DeploymentStrategy",
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
    },
    {
      "alias": "totalReplicas",
      "args": null,
      "concreteType": "ModelReplicaConnection",
      "kind": "LinkedField",
      "name": "replicas",
      "plural": false,
      "selections": (v2/*: any*/),
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
      "selections": (v2/*: any*/),
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
        (v0/*: any*/),
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
                (v0/*: any*/),
                (v1/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIDeploymentOwnerInfo_deployment"
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};
})();

(node as any).hash = "d7e2e42d651a342fde7c1a32802c0ff1";

export default node;
