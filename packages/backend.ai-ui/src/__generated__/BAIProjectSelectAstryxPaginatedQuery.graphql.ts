/**
 * @generated SignedSource<<256d0f3bf2e6af4f1a19b68e78a39121>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSelectAstryxPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
};
export type BAIProjectSelectAstryxPaginatedQuery$data = {
  readonly group_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIProjectSelectAstryxPaginatedQuery = {
  response: BAIProjectSelectAstryxPaginatedQuery$data;
  variables: BAIProjectSelectAstryxPaginatedQuery$variables;
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
        "name": "first",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      },
      {
        "kind": "Literal",
        "name": "order",
        "value": "-created_at"
      },
      {
        "kind": "Literal",
        "name": "permission",
        "value": "read_attribute"
      }
    ],
    "concreteType": "GroupConnection",
    "kind": "LinkedField",
    "name": "group_nodes",
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
        "concreteType": "GroupEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GroupNode",
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
    "name": "BAIProjectSelectAstryxPaginatedQuery",
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
    "name": "BAIProjectSelectAstryxPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "7d9d1d96d18ff598316dbf470a748bf4",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIProjectSelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n) {\n  group_nodes(offset: $offset, first: $limit, filter: $filter, permission: \"read_attribute\", order: \"-created_at\") {\n    count\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8731a0aab90607ac5625f51d9cbf0d11";

export default node;
