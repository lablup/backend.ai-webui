/**
 * @generated SignedSource<<0ccc0dffb17f55c452d01e42d5186afa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
export type LoginHistoryFilter = {
  AND?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  NOT?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  OR?: ReadonlyArray<LoginHistoryFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type FailedLoginsPanelQuery$variables = {
  failed: LoginHistoryFilter;
  limit: number;
  offset: number;
};
export type FailedLoginsPanelQuery$data = {
  readonly failedLogins: Result<{
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
  } | null | undefined, unknown>;
};
export type FailedLoginsPanelQuery = {
  response: FailedLoginsPanelQuery$data;
  variables: FailedLoginsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "failed"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FailedLoginsPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "failedLogins",
          "args": (v1/*: any*/),
          "concreteType": "LoginHistoryV2Connection",
          "kind": "LinkedField",
          "name": "adminLoginHistoryV2",
          "plural": false,
          "selections": [
            (v2/*: any*/),
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
                    (v3/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "UserV2",
                      "kind": "LinkedField",
                      "name": "user",
                      "plural": false,
                      "selections": [
                        (v4/*: any*/)
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
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FailedLoginsPanelQuery",
    "selections": [
      {
        "alias": "failedLogins",
        "args": (v1/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "adminLoginHistoryV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      (v3/*: any*/)
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
    "cacheID": "1e5b95fb63ed14aaccf9413cfbe95766",
    "id": null,
    "metadata": {},
    "name": "FailedLoginsPanelQuery",
    "operationKind": "query",
    "text": "query FailedLoginsPanelQuery(\n  $failed: LoginHistoryFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  failedLogins: adminLoginHistoryV2(filter: $failed, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        user {\n          basicInfo {\n            email\n          }\n          id\n        }\n        ...BAILoginHistoryTableFragment\n      }\n    }\n  }\n}\n\nfragment BAILoginHistoryTableFragment on LoginHistoryV2 {\n  id\n  result\n  domainName\n  clientIp @since(version: \"26.9.0\")\n  failReason\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "24fb06b7cd921682481db26f000d3361";

export default node;
