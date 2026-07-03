/**
 * @generated SignedSource<<bc76c96312e15186a8c19266351133d9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LoginSessionOrderField = "CREATED_AT" | "LAST_ACCESSED_AT" | "STATUS" | "%future added value";
export type LoginSessionStatus = "ACTIVE" | "INVALIDATED" | "REVOKED" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type LoginSessionFilter = {
  AND?: ReadonlyArray<LoginSessionFilter> | null | undefined;
  NOT?: ReadonlyArray<LoginSessionFilter> | null | undefined;
  OR?: ReadonlyArray<LoginSessionFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  lastAccessedAt?: DateTimeFilter | null | undefined;
  status?: LoginSessionStatusFilter | null | undefined;
  userId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type LoginSessionStatusFilter = {
  equals?: LoginSessionStatus | null | undefined;
  in?: ReadonlyArray<LoginSessionStatus> | null | undefined;
  notEquals?: LoginSessionStatus | null | undefined;
  notIn?: ReadonlyArray<LoginSessionStatus> | null | undefined;
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
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type LoginSessionOrderBy = {
  direction?: OrderDirection;
  field: LoginSessionOrderField;
};
export type LoginSessionQuery$variables = {
  filter?: LoginSessionFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<LoginSessionOrderBy> | null | undefined;
};
export type LoginSessionQuery$data = {
  readonly myLoginSessionsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAILoginSessionTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type LoginSessionQuery = {
  response: LoginSessionQuery$data;
  variables: LoginSessionQuery$variables;
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
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    "name": "LoginSessionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "LoginSessionV2Connection",
        "kind": "LinkedField",
        "name": "myLoginSessionsV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "LoginSessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "LoginSessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAILoginSessionTableFragment"
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
    "name": "LoginSessionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "LoginSessionV2Connection",
        "kind": "LinkedField",
        "name": "myLoginSessionsV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "LoginSessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "LoginSessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "accessKey",
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
                    "name": "invalidatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      {
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
    "cacheID": "3c52e1ab1acbf8872809ee9723190991",
    "id": null,
    "metadata": {},
    "name": "LoginSessionQuery",
    "operationKind": "query",
    "text": "query LoginSessionQuery(\n  $filter: LoginSessionFilter\n  $orderBy: [LoginSessionOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  myLoginSessionsV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAILoginSessionTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAILoginSessionTableFragment on LoginSessionV2 {\n  id\n  accessKey\n  createdAt\n  invalidatedAt\n  user {\n    id\n    basicInfo {\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e94abd053b13ae1aec108d68c4eec30";

export default node;
