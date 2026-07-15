/**
 * @generated SignedSource<<e86c0a64b627a550fb6ae79351ff9ce7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type ReplicaStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type TrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type DeploymentFilter = {
  AND?: ReadonlyArray<DeploymentFilter> | null | undefined;
  NOT?: ReadonlyArray<DeploymentFilter> | null | undefined;
  OR?: ReadonlyArray<DeploymentFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  createdUserId?: UUIDFilter | null | undefined;
  destroyedAt?: NullableDateTimeFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  endpointUrl?: StringFilter | null | undefined;
  name?: StringFilter | null | undefined;
  openToPublic?: boolean | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  replicas?: ReplicaNestedFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
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
  none?: ReplicaFilter | null | undefined;
  some?: ReplicaFilter | null | undefined;
};
export type ReplicaFilter = {
  AND?: ReadonlyArray<ReplicaFilter> | null | undefined;
  NOT?: ReadonlyArray<ReplicaFilter> | null | undefined;
  OR?: ReadonlyArray<ReplicaFilter> | null | undefined;
  status?: ReplicaStatusFilter | null | undefined;
  trafficStatus?: TrafficStatusFilter | null | undefined;
};
export type ReplicaStatusFilter = {
  equals?: ReplicaStatus | null | undefined;
  in?: ReadonlyArray<ReplicaStatus> | null | undefined;
  notEquals?: ReplicaStatus | null | undefined;
  notIn?: ReadonlyArray<ReplicaStatus> | null | undefined;
};
export type TrafficStatusFilter = {
  equals?: TrafficStatus | null | undefined;
  in?: ReadonlyArray<TrafficStatus> | null | undefined;
  notEquals?: TrafficStatus | null | undefined;
  notIn?: ReadonlyArray<TrafficStatus> | null | undefined;
};
export type EndpointSelectQuery$variables = {
  filter?: DeploymentFilter | null | undefined;
  limit: number;
  offset: number;
};
export type EndpointSelectQuery$data = {
  readonly myDeployments: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metadata: {
          readonly name: string;
        };
        readonly networkAccess: {
          readonly endpointUrl: string | null | undefined;
        };
      };
    }>;
  } | null | undefined;
};
export type EndpointSelectQuery = {
  response: EndpointSelectQuery$data;
  variables: EndpointSelectQuery$variables;
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
v3 = [
  {
    "alias": null,
    "args": [
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
      }
    ],
    "concreteType": "ModelDeploymentConnection",
    "kind": "LinkedField",
    "name": "myDeployments",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointSelectQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "EndpointSelectQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "59276eeed8412a7f99e87da25af00f00",
    "id": null,
    "metadata": {},
    "name": "EndpointSelectQuery",
    "operationKind": "query",
    "text": "query EndpointSelectQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: DeploymentFilter\n) {\n  myDeployments(offset: $offset, limit: $limit, filter: $filter) {\n    count\n    edges {\n      node {\n        id\n        metadata {\n          name\n        }\n        networkAccess {\n          endpointUrl\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3349f213bde0a53404a19b8bde136569";

export default node;
