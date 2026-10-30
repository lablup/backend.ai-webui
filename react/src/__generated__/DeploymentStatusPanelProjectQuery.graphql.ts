/**
 * @generated SignedSource<<5f5a34b750fb85697e39a5aca22ff6be>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type ReplicaHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type ReplicaStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type ScalingState = "SCALING" | "STABLE" | "%future added value";
export type TrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type DeploymentFilter = {
  AND?: ReadonlyArray<DeploymentFilter> | null | undefined;
  NOT?: ReadonlyArray<DeploymentFilter> | null | undefined;
  OR?: ReadonlyArray<DeploymentFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  createdUserId?: UUIDFilter | null | undefined;
  desiredReplicas?: IntFilter | null | undefined;
  destroyedAt?: NullableDateTimeFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  endpointUrl?: StringFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  openToPublic?: boolean | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  replicas?: ReplicaNestedFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
  scalingState?: ScalingStateFilter | null | undefined;
  status?: DeploymentStatusFilter | null | undefined;
  tags?: StringFilter | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type DeploymentStatusFilter = {
  equals?: DeploymentStatus | null | undefined;
  in?: ReadonlyArray<DeploymentStatus> | null | undefined;
  notEquals?: DeploymentStatus | null | undefined;
  notIn?: ReadonlyArray<DeploymentStatus> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type NullableDateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  isNull?: boolean | null | undefined;
  notEquals?: string | null | undefined;
};
export type ReplicaNestedFilter = {
  every?: ReplicaFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: ReplicaFilter | null | undefined;
  some?: ReplicaFilter | null | undefined;
};
export type ReplicaFilter = {
  AND?: ReadonlyArray<ReplicaFilter> | null | undefined;
  NOT?: ReadonlyArray<ReplicaFilter> | null | undefined;
  OR?: ReadonlyArray<ReplicaFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  healthStatus?: ReplicaHealthStatusFilter | null | undefined;
  revisionId?: UUIDFilter | null | undefined;
  sessionId?: UUIDFilter | null | undefined;
  status?: ReplicaStatusFilter | null | undefined;
  trafficStatus?: TrafficStatusFilter | null | undefined;
};
export type ReplicaStatusFilter = {
  equals?: ReplicaStatus | null | undefined;
  in?: ReadonlyArray<ReplicaStatus> | null | undefined;
  notEquals?: ReplicaStatus | null | undefined;
  notIn?: ReadonlyArray<ReplicaStatus> | null | undefined;
};
export type ReplicaHealthStatusFilter = {
  equals?: ReplicaHealthStatus | null | undefined;
  in?: ReadonlyArray<ReplicaHealthStatus> | null | undefined;
  notEquals?: ReplicaHealthStatus | null | undefined;
  notIn?: ReadonlyArray<ReplicaHealthStatus> | null | undefined;
};
export type TrafficStatusFilter = {
  equals?: TrafficStatus | null | undefined;
  in?: ReadonlyArray<TrafficStatus> | null | undefined;
  notEquals?: TrafficStatus | null | undefined;
  notIn?: ReadonlyArray<TrafficStatus> | null | undefined;
};
export type EntityLabelNestedFilter = {
  every?: EntityLabelFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: EntityLabelFilter | null | undefined;
  some?: EntityLabelFilter | null | undefined;
};
export type EntityLabelFilter = {
  AND?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  OR?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type ScalingStateFilter = {
  equals?: ScalingState | null | undefined;
  in?: ReadonlyArray<ScalingState> | null | undefined;
  notEquals?: ScalingState | null | undefined;
  notIn?: ReadonlyArray<ScalingState> | null | undefined;
};
export type DeploymentStatusPanelProjectQuery$variables = {
  filter: DeploymentFilter;
  limit: number;
  offset: number;
  projectId: string;
};
export type DeploymentStatusPanelProjectQuery$data = {
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
export type DeploymentStatusPanelProjectQuery = {
  response: DeploymentStatusPanelProjectQuery$data;
  variables: DeploymentStatusPanelProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
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
v8 = [
  (v5/*: any*/)
],
v9 = {
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
  "selections": (v8/*: any*/),
  "storageKey": "replicas(filter:{\"healthStatus\":{\"equals\":\"HEALTHY\"}})"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentStatusPanelProjectQuery",
    "selections": [
      {
        "alias": "deployments",
        "args": (v4/*: any*/),
        "concreteType": "ModelDeploymentConnection",
        "kind": "LinkedField",
        "name": "projectDeployments",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v9/*: any*/),
                  {
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "withDetails",
                        "value": false
                      }
                    ],
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
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentStatusPanelProjectQuery",
    "selections": [
      {
        "alias": "deployments",
        "args": (v4/*: any*/),
        "concreteType": "ModelDeploymentConnection",
        "kind": "LinkedField",
        "name": "projectDeployments",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v9/*: any*/),
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
                    "selections": (v8/*: any*/),
                    "storageKey": "replicas(filter:{\"status\":{\"equals\":\"RUNNING\"}})"
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
    "cacheID": "50ff24fe470b002fe78d5337ba9dfdd9",
    "id": null,
    "metadata": {},
    "name": "DeploymentStatusPanelProjectQuery",
    "operationKind": "query",
    "text": "query DeploymentStatusPanelProjectQuery(\n  $projectId: UUID!\n  $filter: DeploymentFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  deployments: projectDeployments(scope: {projectId: $projectId}, filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        replicaState {\n          desiredReplicaCount\n        }\n        healthyReplicas: replicas(filter: {healthStatus: {equals: HEALTHY}}) {\n          count\n        }\n        ...BAIModelDeploymentNodesFragment_CtZCR\n      }\n    }\n  }\n}\n\nfragment BAIModelDeploymentNodesFragment_CtZCR on ModelDeployment {\n  id\n  entityId\n  currentRevisionId\n  metadata {\n    projectId\n    domainName\n    name\n    status\n    createdAt\n    updatedAt\n    resourceGroupName\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n  runningReplicas: replicas(filter: {status: {equals: RUNNING}}) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "d5358e67878aad47a5a36c49df16d2df";

export default node;
