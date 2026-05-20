/**
 * @generated SignedSource<<1305494156ad58af0d3e155c1bf86b71>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentList_modelDeploymentConnection$data = {
  readonly count: number;
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly currentRevision: {
        readonly id: string;
        readonly modelMountConfig: {
          readonly vfolder: {
            readonly id: string;
            readonly name: string | null | undefined;
          } | null | undefined;
        } | null | undefined;
        readonly revisionNumber: number;
        readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
      } | null | undefined;
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
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"DeploymentTagChips_metadata">;
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
      readonly totalReplicas: {
        readonly count: number;
      } | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"DeploymentOwnerInfo_deployment" | "DeploymentSettingModal_deployment">;
    };
  }>;
  readonly " $fragmentType": "DeploymentList_modelDeploymentConnection";
};
export type DeploymentList_modelDeploymentConnection$key = {
  readonly " $data"?: DeploymentList_modelDeploymentConnection$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentList_modelDeploymentConnection">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentList_modelDeploymentConnection",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelDeploymentEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModelDeployment",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelDeploymentMetadata",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": [
                (v2/*: any*/),
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
                  "name": "domainName",
                  "storageKey": null
                },
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
                        (v2/*: any*/)
                      ],
                      "storageKey": null
                    },
                    (v1/*: any*/)
                  ],
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "DeploymentTagChips_metadata"
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
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentSettingModal_deployment"
            },
            {
              "alias": "totalReplicas",
              "args": null,
              "concreteType": "ModelReplicaConnection",
              "kind": "LinkedField",
              "name": "replicas",
              "plural": false,
              "selections": (v3/*: any*/),
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
              "selections": (v3/*: any*/),
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
                (v1/*: any*/),
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
                        (v1/*: any*/),
                        (v2/*: any*/)
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "DeploymentRevisionDetail_revision"
                }
              ],
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentOwnerInfo_deployment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeploymentConnection",
  "abstractKey": null
};
})();

(node as any).hash = "152ca595efa92576b528380a4b3adca2";

export default node;
