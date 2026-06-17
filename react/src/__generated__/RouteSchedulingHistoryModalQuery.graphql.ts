/**
 * @generated SignedSource<<ded0c3aa6171af69b86f1a792cff28d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RouteHistoryOrderField = "CREATED_AT" | "UPDATED_AT" | "%future added value";
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type RouteScope = {
  routeId: string;
};
export type RouteHistoryFilter = {
  AND?: ReadonlyArray<RouteHistoryFilter> | null | undefined;
  NOT?: ReadonlyArray<RouteHistoryFilter> | null | undefined;
  OR?: ReadonlyArray<RouteHistoryFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  deploymentId?: UUIDFilter | null | undefined;
  errorCode?: StringFilter | null | undefined;
  fromStatus?: ReadonlyArray<string> | null | undefined;
  id?: UUIDFilter | null | undefined;
  message?: StringFilter | null | undefined;
  phase?: StringFilter | null | undefined;
  result?: SchedulingResultFilter | null | undefined;
  routeId?: UUIDFilter | null | undefined;
  toStatus?: ReadonlyArray<string> | null | undefined;
  updatedAt?: DateTimeFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
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
export type SchedulingResultFilter = {
  equals?: SchedulingResult | null | undefined;
  in?: ReadonlyArray<SchedulingResult> | null | undefined;
  notEquals?: SchedulingResult | null | undefined;
  notIn?: ReadonlyArray<SchedulingResult> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type RouteHistoryOrderBy = {
  direction?: OrderDirection;
  field: RouteHistoryOrderField;
};
export type RouteSchedulingHistoryModalQuery$variables = {
  filter?: RouteHistoryFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RouteHistoryOrderBy> | null | undefined;
  scope: RouteScope;
};
export type RouteSchedulingHistoryModalQuery$data = {
  readonly routeScopedSchedulingHistories: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type RouteSchedulingHistoryModalQuery = {
  response: RouteSchedulingHistoryModalQuery$data;
  variables: RouteSchedulingHistoryModalQuery$variables;
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "errorCode",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
};
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
    "name": "RouteSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "RouteHistoryConnection",
        "kind": "LinkedField",
        "name": "routeScopedSchedulingHistories",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RouteHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RouteHistory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIRouteSchedulingHistoryTableFragment"
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
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "RouteSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "RouteHistoryConnection",
        "kind": "LinkedField",
        "name": "routeScopedSchedulingHistories",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RouteHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RouteHistory",
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
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SubStepResultGQL",
                    "kind": "LinkedField",
                    "name": "subSteps",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "step",
                        "storageKey": null
                      },
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startedAt",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "category",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "phase",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "fromStatus",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "toStatus",
                    "storageKey": null
                  },
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "attempts",
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
    "cacheID": "e02133438de747b29f05fb0c3109339d",
    "id": null,
    "metadata": {},
    "name": "RouteSchedulingHistoryModalQuery",
    "operationKind": "query",
    "text": "query RouteSchedulingHistoryModalQuery(\n  $scope: RouteScope!\n  $filter: RouteHistoryFilter\n  $orderBy: [RouteHistoryOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  routeScopedSchedulingHistories(scope: $scope, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAIRouteSchedulingHistoryTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIRouteSchedulingHistoryNodeTableFragment on RouteHistory {\n  id\n  category\n  phase\n  fromStatus\n  toStatus\n  result\n  errorCode\n  message\n  attempts\n  createdAt\n  updatedAt\n}\n\nfragment BAIRouteSchedulingHistoryTableFragment on RouteHistory {\n  id\n  result\n  subSteps {\n    ...BAISubStepNodesFragment\n  }\n  ...BAIRouteSchedulingHistoryNodeTableFragment\n}\n\nfragment BAISubStepNodesFragment on SubStepResultGQL {\n  step\n  result\n  errorCode\n  message\n  startedAt\n  endedAt\n}\n"
  }
};
})();

(node as any).hash = "e770c8de50ced262d1f75ecd5be88c57";

export default node;
