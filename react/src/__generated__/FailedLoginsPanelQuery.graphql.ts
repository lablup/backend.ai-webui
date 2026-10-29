/**
 * @generated SignedSource<<7e2a3664d04d7366a8881327561ac8ae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
export type LoginHistoryFilter = {
  AND?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  NOT?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  OR?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  result?: LoginHistoryResultFilter | null | undefined;
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
export type LoginHistoryResultFilter = {
  equals?: LoginAttemptResult | null | undefined;
  in?: ReadonlyArray<LoginAttemptResult> | null | undefined;
  notEquals?: LoginAttemptResult | null | undefined;
  notIn?: ReadonlyArray<LoginAttemptResult> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type FailedLoginsPanelQuery$variables = {
  failed: LoginHistoryFilter;
  limit: number;
  offset: number;
  previousFailed: LoginHistoryFilter;
};
export type FailedLoginsPanelQuery$data = {
  readonly failedLogins: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly user: {
          readonly basicInfo: {
            readonly email: string;
          };
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BAILoginHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
  readonly previousFailed: {
    readonly count: number;
  } | null | undefined;
};
export type FailedLoginsPanelQuery = {
  response: FailedLoginsPanelQuery$data;
  variables: FailedLoginsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "failed"
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
  "name": "previousFailed"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = {
  "alias": "previousFailed",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailed"
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 1
    }
  ],
  "concreteType": "LoginHistoryV2Connection",
  "kind": "LinkedField",
  "name": "adminLoginHistoryV2",
  "plural": false,
  "selections": [
    (v4/*: any*/)
  ],
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "failed"
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
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
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
    }
  ],
  "storageKey": null
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
    "name": "FailedLoginsPanelQuery",
    "selections": [
      (v5/*: any*/),
      {
        "alias": "failedLogins",
        "args": (v6/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "adminLoginHistoryV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "LoginHistoryV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "LoginHistoryV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAILoginHistoryTableFragment"
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
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "FailedLoginsPanelQuery",
    "selections": [
      (v5/*: any*/),
      {
        "alias": "failedLogins",
        "args": (v6/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "adminLoginHistoryV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "LoginHistoryV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "LoginHistoryV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v7/*: any*/)
                    ],
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
                    "kind": "ScalarField",
                    "name": "domainName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clientIp",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "failReason",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
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
    "cacheID": "c19f2da9164e5364be864a8ee3e50391",
    "id": null,
    "metadata": {},
    "name": "FailedLoginsPanelQuery",
    "operationKind": "query",
    "text": "query FailedLoginsPanelQuery(\n  $failed: LoginHistoryFilter!\n  $previousFailed: LoginHistoryFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  previousFailed: adminLoginHistoryV2(filter: $previousFailed, limit: 1) {\n    count\n  }\n  failedLogins: adminLoginHistoryV2(filter: $failed, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        user {\n          basicInfo {\n            email\n          }\n          id\n        }\n        ...BAILoginHistoryTableFragment\n      }\n    }\n  }\n}\n\nfragment BAILoginHistoryTableFragment on LoginHistoryV2 {\n  id\n  result\n  domainName\n  clientIp @since(version: \"26.9.0\")\n  failReason\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "58b768caa6579c8625f8001d85819202";

export default node;
