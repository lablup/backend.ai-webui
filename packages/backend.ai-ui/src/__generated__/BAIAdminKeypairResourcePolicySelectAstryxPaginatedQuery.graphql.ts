/**
 * @generated SignedSource<<9367571797bf81ad087e77c9d304828f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyV2Filter = {
  AND?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  NOT?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  OR?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  idleTimeout?: IntFilter | null | undefined;
  keypair?: KeypairResourcePolicyKeypairNestedFilter | null | undefined;
  maxConcurrentSessions?: IntFilter | null | undefined;
  maxConcurrentSftpSessions?: IntFilter | null | undefined;
  maxContainersPerSession?: IntFilter | null | undefined;
  maxPendingSessionCount?: IntFilter | null | undefined;
  maxPriority?: IntFilter | null | undefined;
  maxSessionLifetime?: IntFilter | null | undefined;
  name?: StringFilter | null | undefined;
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
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type KeypairResourcePolicyKeypairNestedFilter = {
  userId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery$variables = {
  filter?: KeypairResourcePolicyV2Filter | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery$data = {
  readonly adminKeypairResourcePoliciesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery = {
  response: BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery$data;
  variables: BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery$variables;
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
v3 = [
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
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "ASC",
            "field": "NAME"
          }
        ]
      }
    ],
    "concreteType": "KeypairResourcePolicyV2Connection",
    "kind": "LinkedField",
    "name": "adminKeypairResourcePoliciesV2",
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
        "concreteType": "KeypairResourcePolicyV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2",
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
                "name": "name",
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
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "54980f8cb4d01aa1e91316efc422519b",
    "id": null,
    "metadata": {},
    "name": "BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: KeypairResourcePolicyV2Filter\n) {\n  adminKeypairResourcePoliciesV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) {\n    count\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a71c91cba4e90665df226527e453e093";

export default node;
