/**
 * @generated SignedSource<<fbaa078bfb89df9feb5c2c7dfcf726ac>>
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
export type KeypairsLoginsPanelQuery$variables = {
  failed: LoginHistoryFilter;
  limit: number;
  offset: number;
  previousFailed: LoginHistoryFilter;
};
export type KeypairsLoginsPanelQuery$data = {
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
  readonly inactiveKeypairs: {
    readonly count: number;
  } | null | undefined;
  readonly keypairs: {
    readonly count: number;
  } | null | undefined;
  readonly previousFailed: {
    readonly count: number;
  } | null | undefined;
};
export type KeypairsLoginsPanelQuery = {
  response: KeypairsLoginsPanelQuery$data;
  variables: KeypairsLoginsPanelQuery$variables;
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
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = [
  (v5/*: any*/)
],
v7 = {
  "alias": "keypairs",
  "args": [
    (v4/*: any*/)
  ],
  "concreteType": "KeyPairConnection",
  "kind": "LinkedField",
  "name": "adminKeypairsV2",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": "adminKeypairsV2(limit:1)"
},
v8 = {
  "alias": "inactiveKeypairs",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": false
      }
    },
    (v4/*: any*/)
  ],
  "concreteType": "KeyPairConnection",
  "kind": "LinkedField",
  "name": "adminKeypairsV2",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": "adminKeypairsV2(filter:{\"isActive\":false},limit:1)"
},
v9 = {
  "alias": "previousFailed",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailed"
    },
    (v4/*: any*/)
  ],
  "concreteType": "LoginHistoryV2Connection",
  "kind": "LinkedField",
  "name": "adminLoginHistoryV2",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v10 = [
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
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
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
    "name": "KeypairsLoginsPanelQuery",
    "selections": [
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      {
        "alias": "failedLogins",
        "args": (v10/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "adminLoginHistoryV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v12/*: any*/)
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
    "name": "KeypairsLoginsPanelQuery",
    "selections": [
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      {
        "alias": "failedLogins",
        "args": (v10/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "adminLoginHistoryV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v12/*: any*/),
                      (v11/*: any*/)
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
    "cacheID": "16fd68698cc547922950f0ac5a53f65f",
    "id": null,
    "metadata": {},
    "name": "KeypairsLoginsPanelQuery",
    "operationKind": "query",
    "text": "query KeypairsLoginsPanelQuery(\n  $failed: LoginHistoryFilter!\n  $previousFailed: LoginHistoryFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  keypairs: adminKeypairsV2(limit: 1) {\n    count\n  }\n  inactiveKeypairs: adminKeypairsV2(filter: {isActive: false}, limit: 1) {\n    count\n  }\n  previousFailed: adminLoginHistoryV2(filter: $previousFailed, limit: 1) {\n    count\n  }\n  failedLogins: adminLoginHistoryV2(filter: $failed, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        user {\n          basicInfo {\n            email\n          }\n          id\n        }\n        ...BAILoginHistoryTableFragment\n      }\n    }\n  }\n}\n\nfragment BAILoginHistoryTableFragment on LoginHistoryV2 {\n  id\n  result\n  domainName\n  clientIp @since(version: \"26.9.0\")\n  failReason\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "5f018fc9874916d1b045b769af758f52";

export default node;
