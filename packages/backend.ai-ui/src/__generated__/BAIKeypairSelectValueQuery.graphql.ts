/**
 * @generated SignedSource<<9524de6e0f97b6869bf85ca58049b5a4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairFilter = {
  AND?: ReadonlyArray<KeypairFilter> | null | undefined;
  NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
  OR?: ReadonlyArray<KeypairFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  isDefault?: boolean | null | undefined;
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
export type BAIKeypairSelectValueQuery$variables = {
  filter?: KeypairFilter | null | undefined;
  limit: number;
  skipSelected: boolean;
};
export type BAIKeypairSelectValueQuery$data = {
  readonly adminKeypairsV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type BAIKeypairSelectValueQuery = {
  response: BAIKeypairSelectValueQuery$data;
  variables: BAIKeypairSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
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
          }
        ],
        "concreteType": "KeyPairConnection",
        "kind": "LinkedField",
        "name": "adminKeypairsV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "KeyPairV2",
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
                    "name": "accessKey",
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIKeypairSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIKeypairSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "cc2f71b3b5cbefaff83157663d4054d0",
    "id": null,
    "metadata": {},
    "name": "BAIKeypairSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIKeypairSelectValueQuery(\n  $filter: KeypairFilter\n  $limit: Int!\n  $skipSelected: Boolean!\n) {\n  adminKeypairsV2(filter: $filter, limit: $limit) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        accessKey\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a28ac3a310ae9d17b4e6d3269a7dce33";

export default node;
