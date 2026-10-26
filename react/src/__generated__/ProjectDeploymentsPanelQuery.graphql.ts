/**
 * @generated SignedSource<<39079f6416a06a0ceabe6bb46cc15fc4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectDeploymentsPanelQuery$variables = {
  limit: number;
  offset: number;
  projectId: string;
};
export type ProjectDeploymentsPanelQuery$data = {
  readonly deployments: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly healthyReplicas: {
          readonly count: number;
        } | null | undefined;
        readonly id: string;
        readonly replicaState: {
          readonly desiredReplicaCount: number;
        };
        readonly " $fragmentSpreads": FragmentRefs<"BAIModelDeploymentNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type ProjectDeploymentsPanelQuery = {
  response: ProjectDeploymentsPanelQuery$data;
  variables: ProjectDeploymentsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "destroyedAt": {
        "isNull": true
      }
    }
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "CREATED_AT"
      }
    ]
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
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
v7 = [
  (v4/*: any*/)
],
v8 = {
  "alias": "healthyReplicas",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "healthStatus": {
          "equals": "HEALTHY"
        }
      }
    }
  ],
  "concreteType": "ModelReplicaConnection",
  "kind": "LinkedField",
  "name": "replicas",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": "replicas(filter:{\"healthStatus\":{\"equals\":\"HEALTHY\"}})"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectDeploymentsPanelQuery",
    "selections": [
      {
        "alias": "deployments",
        "args": (v3/*: any*/),
        "concreteType": "ModelDeploymentConnection",
        "kind": "LinkedField",
        "name": "projectDeployments",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v8/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIModelDeploymentNodesFragment"
                  }
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectDeploymentsPanelQuery",
    "selections": [
      {
        "alias": "deployments",
        "args": (v3/*: any*/),
        "concreteType": "ModelDeploymentConnection",
        "kind": "LinkedField",
        "name": "projectDeployments",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v8/*: any*/),
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
                      (v9/*: any*/),
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
                              (v9/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v5/*: any*/)
                        ],
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
                    "selections": (v7/*: any*/),
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
                      (v5/*: any*/),
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
                              (v5/*: any*/),
                              (v9/*: any*/)
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
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "limit",
                        "value": 100
                      }
                    ],
                    "concreteType": "EntityLabelConnection",
                    "kind": "LinkedField",
                    "name": "entityLabels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "EntityLabelEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "EntityLabel",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "key",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "value",
                                "storageKey": null
                              },
                              (v5/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "fieldId",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "entityLabels(limit:100)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "creator",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
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
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "username",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "fullName",
                            "storageKey": null
                          }
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c1f0be445947a929de710559d11061e9",
    "id": null,
    "metadata": {},
    "name": "ProjectDeploymentsPanelQuery",
    "operationKind": "query",
    "text": "query ProjectDeploymentsPanelQuery(\n  $projectId: UUID!\n  $limit: Int!\n  $offset: Int!\n) {\n  deployments: projectDeployments(scope: {projectId: $projectId}, filter: {destroyedAt: {isNull: true}}, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        replicaState {\n          desiredReplicaCount\n        }\n        healthyReplicas: replicas(filter: {healthStatus: {equals: HEALTHY}}) {\n          count\n        }\n        ...BAIModelDeploymentNodesFragment\n      }\n    }\n  }\n}\n\nfragment BAIDeploymentOwnerInfo_deployment on ModelDeployment {\n  id\n  creator {\n    id\n    basicInfo {\n      email\n      username\n      fullName\n    }\n  }\n}\n\nfragment BAIEntityLabelSettingModalFragment on EntityLabelConnection {\n  edges {\n    node {\n      fieldId\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIEntityLabelTokensFragment on EntityLabelConnection {\n  edges {\n    node {\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIModelDeploymentNodesFragment on ModelDeployment {\n  id\n  entityId\n  currentRevisionId\n  metadata {\n    projectId\n    domainName\n    name\n    status\n    createdAt\n    updatedAt\n    resourceGroupName\n    projectV2 {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n  networkAccess {\n    endpointUrl\n    preferredDomainName\n    openToPublic\n  }\n  defaultDeploymentStrategy {\n    type\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n  runningReplicas: replicas(filter: {status: {equals: RUNNING}}) {\n    count\n  }\n  currentRevision {\n    id\n    revisionNumber\n    modelMountConfig {\n      vfolder {\n        id\n        name\n      }\n    }\n  }\n  entityLabels(limit: 100) {\n    ...BAIEntityLabelTokensFragment\n    ...BAIEntityLabelSettingModalFragment\n  }\n  ...BAIDeploymentOwnerInfo_deployment\n}\n"
  }
};
})();

(node as any).hash = "bfd8ee8a521ff3ab4ea63114f694d419";

export default node;
