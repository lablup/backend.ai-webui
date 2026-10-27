/**
 * @generated SignedSource<<b8a87e87f397a77e5194526c11129500>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
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
export type SchedulingFailuresPanelQuery$variables = {
  expired: SessionSchedulingHistoryFilter;
  failure: SessionSchedulingHistoryFilter;
  filter: SessionSchedulingHistoryFilter;
  giveUp: SessionSchedulingHistoryFilter;
  limit: number;
  needRetry: SessionSchedulingHistoryFilter;
  offset: number;
};
export type SchedulingFailuresPanelQuery$data = {
  readonly expired: {
    readonly count: number;
  } | null | undefined;
  readonly failure: {
    readonly count: number;
  } | null | undefined;
  readonly giveUp: {
    readonly count: number;
  } | null | undefined;
  readonly histories: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly errorCode: string | null | undefined;
        readonly id: string;
        readonly message: string | null | undefined;
        readonly phase: string;
        readonly session: {
          readonly entityId: string;
          readonly metadata: {
            readonly name: string;
          };
          readonly project: {
            readonly basicInfo: {
              readonly name: string;
            };
          } | null | undefined;
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
      };
    }>;
  } | null | undefined;
  readonly needRetry: {
    readonly count: number;
  } | null | undefined;
};
export type SchedulingFailuresPanelQuery = {
  response: SchedulingFailuresPanelQuery$data;
  variables: SchedulingFailuresPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "expired"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "failure"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "giveUp"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "needRetry"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v7 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v9 = [
  (v8/*: any*/)
],
v10 = {
  "alias": "failure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "failure"
    },
    (v7/*: any*/)
  ],
  "concreteType": "SessionSchedulingHistoryConnection",
  "kind": "LinkedField",
  "name": "adminSessionSchedulingHistories",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": "giveUp",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "giveUp"
    },
    (v7/*: any*/)
  ],
  "concreteType": "SessionSchedulingHistoryConnection",
  "kind": "LinkedField",
  "name": "adminSessionSchedulingHistories",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": "expired",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "expired"
    },
    (v7/*: any*/)
  ],
  "concreteType": "SessionSchedulingHistoryConnection",
  "kind": "LinkedField",
  "name": "adminSessionSchedulingHistories",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": "needRetry",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "needRetry"
    },
    (v7/*: any*/)
  ],
  "concreteType": "SessionSchedulingHistoryConnection",
  "kind": "LinkedField",
  "name": "adminSessionSchedulingHistories",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v14 = [
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
  }
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "phase",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "errorCode",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v20 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v21 = {
  "alias": null,
  "args": null,
  "concreteType": "SessionV2MetadataInfo",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
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
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SchedulingFailuresPanelQuery",
    "selections": [
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      {
        "alias": "histories",
        "args": (v14/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "adminSessionSchedulingHistories",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAISchedulingHistoryNodesFragment"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2",
                    "kind": "LinkedField",
                    "name": "session",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2",
                        "kind": "LinkedField",
                        "name": "project",
                        "plural": false,
                        "selections": [
                          (v22/*: any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Operation",
    "name": "SchedulingFailuresPanelQuery",
    "selections": [
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      {
        "alias": "histories",
        "args": (v14/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "adminSessionSchedulingHistories",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "result",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2",
                    "kind": "LinkedField",
                    "name": "session",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2",
                        "kind": "LinkedField",
                        "name": "project",
                        "plural": false,
                        "selections": [
                          (v22/*: any*/),
                          (v15/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
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
    "cacheID": "6bd64a2e48366e3e2e3b778d192a52a6",
    "id": null,
    "metadata": {},
    "name": "SchedulingFailuresPanelQuery",
    "operationKind": "query",
    "text": "query SchedulingFailuresPanelQuery(\n  $filter: SessionSchedulingHistoryFilter!\n  $failure: SessionSchedulingHistoryFilter!\n  $giveUp: SessionSchedulingHistoryFilter!\n  $expired: SessionSchedulingHistoryFilter!\n  $needRetry: SessionSchedulingHistoryFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  failure: adminSessionSchedulingHistories(filter: $failure, limit: 1) {\n    count\n  }\n  giveUp: adminSessionSchedulingHistories(filter: $giveUp, limit: 1) {\n    count\n  }\n  expired: adminSessionSchedulingHistories(filter: $expired, limit: 1) {\n    count\n  }\n  needRetry: adminSessionSchedulingHistories(filter: $needRetry, limit: 1) {\n    count\n  }\n  histories: adminSessionSchedulingHistories(filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        phase\n        errorCode\n        message\n        ...BAISchedulingHistoryNodesFragment\n        session {\n          entityId\n          metadata {\n            name\n          }\n          project {\n            basicInfo {\n              name\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory {\n  id\n  attempts\n  createdAt\n  updatedAt\n  fromStatus\n  toStatus\n  message\n  phase\n  result\n}\n"
  }
};
})();

(node as any).hash = "b2c7138dfa96ce16b31d3bdc185df21d";

export default node;
