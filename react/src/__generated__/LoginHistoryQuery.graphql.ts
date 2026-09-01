/**
 * @generated SignedSource<<071a8e61632da75f29d4e2d5f4e626e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
export type LoginHistoryOrderField = "CREATED_AT" | "DOMAIN_NAME" | "RESULT" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
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
export type LoginHistoryOrderBy = {
  direction?: OrderDirection;
  field: LoginHistoryOrderField;
};
export type LoginHistoryQuery$variables = {
  filter?: LoginHistoryFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<LoginHistoryOrderBy> | null | undefined;
};
export type LoginHistoryQuery$data = {
  readonly myLoginHistoryV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAILoginHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type LoginHistoryQuery = {
  response: LoginHistoryQuery$data;
  variables: LoginHistoryQuery$variables;
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
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
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
    "name": "LoginHistoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "myLoginHistoryV2",
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
    "name": "LoginHistoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "LoginHistoryV2Connection",
        "kind": "LinkedField",
        "name": "myLoginHistoryV2",
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
    "cacheID": "d3adafeb86e63588f4380d9b4c4e9374",
    "id": null,
    "metadata": {},
    "name": "LoginHistoryQuery",
    "operationKind": "query",
    "text": "query LoginHistoryQuery(\n  $filter: LoginHistoryFilter\n  $orderBy: [LoginHistoryOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  myLoginHistoryV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAILoginHistoryTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAILoginHistoryTableFragment on LoginHistoryV2 {\n  id\n  result\n  domainName\n  failReason\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "e87d7bf9cea51106011c02a4e6b6a633";

export default node;
