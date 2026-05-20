/**
 * @generated SignedSource<<06f07d8ab228f2240ffbd637b1cbb31a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type SessionSchedulingHistoryOrderField = "CREATED_AT" | "UPDATED_AT" | "%future added value";
export type SessionScope = {
  sessionId: string;
};
export type SessionSchedulingHistoryFilter = {
  AND?: ReadonlyArray<SessionSchedulingHistoryFilter> | null | undefined;
  NOT?: ReadonlyArray<SessionSchedulingHistoryFilter> | null | undefined;
  OR?: ReadonlyArray<SessionSchedulingHistoryFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  errorCode?: StringFilter | null | undefined;
  fromStatus?: ReadonlyArray<string> | null | undefined;
  id?: UUIDFilter | null | undefined;
  message?: StringFilter | null | undefined;
  phase?: StringFilter | null | undefined;
  result?: SchedulingResultFilter | null | undefined;
  sessionId?: UUIDFilter | null | undefined;
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
export type SessionSchedulingHistoryOrderBy = {
  direction?: OrderDirection;
  field: SessionSchedulingHistoryOrderField;
};
export type SessionSchedulingHistoryModalQuery$variables = {
  filter?: SessionSchedulingHistoryFilter | null | undefined;
  orderBy?: ReadonlyArray<SessionSchedulingHistoryOrderBy> | null | undefined;
  scope: SessionScope;
};
export type SessionSchedulingHistoryModalQuery$data = {
  readonly sessionScopedSchedulingHistories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type SessionSchedulingHistoryModalQuery = {
  response: SessionSchedulingHistoryModalQuery$data;
  variables: SessionSchedulingHistoryModalQuery$variables;
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
  "name": "orderBy"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
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
    "name": "SessionSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionSchedulingHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionSchedulingHistory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAISchedulingHistoryNodesFragment"
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
    "name": "SessionSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionSchedulingHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionSchedulingHistory",
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
                    "kind": "ScalarField",
                    "name": "sessionId",
                    "storageKey": null
                  },
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
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "phase",
                    "storageKey": null
                  },
                  (v5/*: any*/),
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
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "errorCode",
                        "storageKey": null
                      },
                      (v4/*: any*/),
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
    "cacheID": "851c610d6e5b4ca317f8e6f573444bb0",
    "id": null,
    "metadata": {},
    "name": "SessionSchedulingHistoryModalQuery",
    "operationKind": "query",
    "text": "query SessionSchedulingHistoryModalQuery(\n  $scope: SessionScope!\n  $filter: SessionSchedulingHistoryFilter\n  $orderBy: [SessionSchedulingHistoryOrderBy!]\n) {\n  sessionScopedSchedulingHistories(scope: $scope, filter: $filter, orderBy: $orderBy) {\n    edges {\n      node {\n        ...BAISchedulingHistoryNodesFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory {\n  id\n  sessionId\n  attempts\n  createdAt\n  updatedAt\n  fromStatus\n  toStatus\n  message\n  phase\n  result\n  subSteps {\n    ...BAISessionHistorySubStepNodesFragment\n  }\n}\n\nfragment BAISessionHistorySubStepNodesFragment on SubStepResultGQL {\n  step\n  result\n  errorCode\n  message\n  startedAt\n  endedAt\n}\n"
  }
};
})();

(node as any).hash = "abbb837538ecf66fee1c3fb466b6c147";

export default node;
