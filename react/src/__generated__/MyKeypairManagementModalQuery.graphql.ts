/**
 * @generated SignedSource<<d4c3a9b36eb1200ab652d0210ec5532d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairOrderField = "ACCESS_KEY" | "CREATED_AT" | "IS_ACTIVE" | "LAST_USED" | "RESOURCE_POLICY" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type KeypairFilter = {
  AND?: ReadonlyArray<KeypairFilter> | null | undefined;
  NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
  OR?: ReadonlyArray<KeypairFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  userId?: UUIDFilter | null | undefined;
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
export type KeypairOrderBy = {
  direction?: OrderDirection;
  field?: KeypairOrderField;
};
export type MyKeypairManagementModalQuery$variables = {
  filter?: KeypairFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<KeypairOrderBy> | null | undefined;
};
export type MyKeypairManagementModalQuery$data = {
  readonly myKeypairs: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly createdAt: string | null | undefined;
        readonly id: string;
        readonly isActive: boolean | null | undefined;
        readonly isAdmin: boolean | null | undefined;
        readonly lastUsed: string | null | undefined;
        readonly modifiedAt: string | null | undefined;
        readonly numQueries: number;
        readonly rateLimit: number;
        readonly resourcePolicy: string;
        readonly sshPublicKey: string | null | undefined;
      };
    }>;
  } | null | undefined;
  readonly user: {
    readonly main_access_key: string | null | undefined;
  } | null | undefined;
};
export type MyKeypairManagementModalQuery = {
  response: MyKeypairManagementModalQuery$data;
  variables: MyKeypairManagementModalQuery$variables;
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
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
    }
  ],
  "concreteType": "KeyPairConnection",
  "kind": "LinkedField",
  "name": "myKeypairs",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "KeyPairGQLEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "KeyPairGQL",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v4/*: any*/),
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
              "name": "isActive",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isAdmin",
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
              "name": "modifiedAt",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lastUsed",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "rateLimit",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "numQueries",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "resourcePolicy",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "sshPublicKey",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "main_access_key",
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
    "name": "MyKeypairManagementModalQuery",
    "selections": [
      (v5/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v6/*: any*/)
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
    "name": "MyKeypairManagementModalQuery",
    "selections": [
      (v5/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bbebbb8246e19369777929f10c8553f7",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalQuery",
    "operationKind": "query",
    "text": "query MyKeypairManagementModalQuery(\n  $filter: KeypairFilter\n  $orderBy: [KeypairOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  myKeypairs(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    edges {\n      node {\n        id\n        accessKey\n        isActive\n        isAdmin\n        createdAt\n        modifiedAt\n        lastUsed\n        rateLimit\n        numQueries\n        resourcePolicy\n        sshPublicKey\n      }\n    }\n    count\n  }\n  user {\n    main_access_key\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1107e47776213c5730d4d4bb3407152a";

export default node;
