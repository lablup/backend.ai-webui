/**
 * @generated SignedSource<<d2b9b625a6c2e20c09167dd8d3f16c8f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KernelV2OrderField = "CLUSTER_HOSTNAME" | "CLUSTER_IDX" | "CLUSTER_MODE" | "CREATED_AT" | "STATUS" | "TERMINATED_AT" | "%future added value";
export type KernelV2Status = "CANCELLED" | "CREATING" | "PENDING" | "PREPARED" | "PREPARING" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type SessionScope = {
  sessionId: string;
};
export type KernelV2Filter = {
  AND?: ReadonlyArray<KernelV2Filter> | null | undefined;
  NOT?: ReadonlyArray<KernelV2Filter> | null | undefined;
  OR?: ReadonlyArray<KernelV2Filter> | null | undefined;
  id?: UUIDFilter | null | undefined;
  sessionId?: UUIDFilter | null | undefined;
  status?: KernelV2StatusFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type KernelV2StatusFilter = {
  equals?: KernelV2Status | null | undefined;
  in?: ReadonlyArray<KernelV2Status> | null | undefined;
  notEquals?: KernelV2Status | null | undefined;
  notIn?: ReadonlyArray<KernelV2Status> | null | undefined;
};
export type KernelV2OrderBy = {
  direction?: OrderDirection;
  field: KernelV2OrderField;
};
export type ConnectedKernelListV2Query$variables = {
  filter?: KernelV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<KernelV2OrderBy> | null | undefined;
  scope: SessionScope;
};
export type ConnectedKernelListV2Query$data = {
  readonly sessionKernelsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly cluster: {
          readonly clusterHostname: string;
          readonly clusterIdx: number;
        };
        readonly id: string;
        readonly lifecycle: {
          readonly status: KernelV2Status;
        };
        readonly resource: {
          readonly agentId: string | null | undefined;
          readonly containerId: string | null | undefined;
        };
      };
    }>;
  } | null | undefined;
};
export type ConnectedKernelListV2Query = {
  response: ConnectedKernelListV2Query$data;
  variables: ConnectedKernelListV2Query$variables;
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
  "name": "orderBy"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v5 = [
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
      },
      {
        "kind": "Variable",
        "name": "orderBy",
        "variableName": "orderBy"
      },
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "KernelV2Connection",
    "kind": "LinkedField",
    "name": "sessionKernelsV2",
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
        "concreteType": "KernelV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KernelV2",
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
                "concreteType": "KernelV2ClusterInfo",
                "kind": "LinkedField",
                "name": "cluster",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clusterHostname",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clusterIdx",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "KernelV2LifecycleInfo",
                "kind": "LinkedField",
                "name": "lifecycle",
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
                "concreteType": "KernelV2ResourceInfo",
                "kind": "LinkedField",
                "name": "resource",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "agentId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "containerId",
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
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ConnectedKernelListV2Query",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ConnectedKernelListV2Query",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "e5ea7fa26d2e96ba51ea3b7ba874cc0a",
    "id": null,
    "metadata": {},
    "name": "ConnectedKernelListV2Query",
    "operationKind": "query",
    "text": "query ConnectedKernelListV2Query(\n  $scope: SessionScope!\n  $filter: KernelV2Filter\n  $orderBy: [KernelV2OrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  sessionKernelsV2(scope: $scope, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        cluster {\n          clusterHostname\n          clusterIdx\n        }\n        lifecycle {\n          status\n        }\n        resource {\n          agentId\n          containerId\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eda1693d0b418b88cf250e16feb50873";

export default node;
