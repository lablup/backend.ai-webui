/**
 * @generated SignedSource<<aeefb97aec78b0d559ceb493ebef47ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type ReplicaHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type ReplicaStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type ScalingState = "SCALING" | "STABLE" | "%future added value";
export type TrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type DeploymentSearchScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
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
export type ResourceChartPanelDeploymentQuery$variables = {
  c0?: DeploymentFilter | null | undefined;
  c0On: boolean;
  c1?: DeploymentFilter | null | undefined;
  c1On: boolean;
  c2?: DeploymentFilter | null | undefined;
  c2On: boolean;
  c3?: DeploymentFilter | null | undefined;
  c3On: boolean;
  c4?: DeploymentFilter | null | undefined;
  c4On: boolean;
  c5?: DeploymentFilter | null | undefined;
  c5On: boolean;
  c6?: DeploymentFilter | null | undefined;
  c6On: boolean;
  c7?: DeploymentFilter | null | undefined;
  c7On: boolean;
  scope: DeploymentSearchScope;
};
export type ResourceChartPanelDeploymentQuery$data = {
  readonly c0?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c1?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c2?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c3?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c4?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c5?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c6?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c7?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type ResourceChartPanelDeploymentQuery = {
  response: ResourceChartPanelDeploymentQuery$data;
  variables: ResourceChartPanelDeploymentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1On"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2On"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3On"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4On"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5On"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6On"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7On"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v17 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v18 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v19 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v20 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v21 = {
  "alias": "c0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c0"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": "c1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c1"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v23 = {
  "alias": "c2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c2"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v24 = {
  "alias": "c3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c3"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v25 = {
  "alias": "c4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c4"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v26 = {
  "alias": "c5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c5"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v27 = {
  "alias": "c6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c6"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v28 = {
  "alias": "c7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c7"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "ModelDeploymentConnection",
  "kind": "LinkedField",
  "name": "scopedDeployments",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelDeploymentQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v21/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v22/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v23/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v24/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v25/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v26/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v27/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v28/*: any*/),
            "to": "RESULT"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v16/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceChartPanelDeploymentQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v21/*: any*/)
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v22/*: any*/)
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v23/*: any*/)
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v24/*: any*/)
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v25/*: any*/)
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v26/*: any*/)
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v27/*: any*/)
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v28/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9b1de070f60ae43afdc48e2abed0f693",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelDeploymentQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelDeploymentQuery(\n  $scope: DeploymentSearchScope!\n  $c0: DeploymentFilter\n  $c0On: Boolean!\n  $c1: DeploymentFilter\n  $c1On: Boolean!\n  $c2: DeploymentFilter\n  $c2On: Boolean!\n  $c3: DeploymentFilter\n  $c3On: Boolean!\n  $c4: DeploymentFilter\n  $c4On: Boolean!\n  $c5: DeploymentFilter\n  $c5On: Boolean!\n  $c6: DeploymentFilter\n  $c6On: Boolean!\n  $c7: DeploymentFilter\n  $c7On: Boolean!\n) {\n  c0: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c0) @include(if: $c0On) {\n    count\n  }\n  c1: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c1) @include(if: $c1On) {\n    count\n  }\n  c2: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c2) @include(if: $c2On) {\n    count\n  }\n  c3: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c3) @include(if: $c3On) {\n    count\n  }\n  c4: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c4) @include(if: $c4On) {\n    count\n  }\n  c5: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c5) @include(if: $c5On) {\n    count\n  }\n  c6: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c6) @include(if: $c6On) {\n    count\n  }\n  c7: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c7) @include(if: $c7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "937884599dbbde9a523506485cd23a1b";

export default node;
