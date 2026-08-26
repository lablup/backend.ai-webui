/**
 * @generated SignedSource<<6167fb8819a7456c6b763f82813d7ffa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useBAIUserEntitySourceQuery$variables = {
  filter?: string | null | undefined;
  first: number;
};
export type useBAIUserEntitySourceQuery$data = {
  readonly user_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly email: string | null | undefined;
        readonly full_name: string | null | undefined;
        readonly id: string;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type useBAIUserEntitySourceQuery = {
  response: useBAIUserEntitySourceQuery$data;
  variables: useBAIUserEntitySourceQuery$variables;
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
    "name": "first"
  }
],
v1 = [
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
        "variableName": "first"
      },
      {
        "kind": "Literal",
        "name": "order",
        "value": "email"
      }
    ],
    "concreteType": "UserConnection",
    "kind": "LinkedField",
    "name": "user_nodes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserNode",
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
                "name": "email",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "full_name",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useBAIUserEntitySourceQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useBAIUserEntitySourceQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1bb4464b8186fc949585eb1c7dc2c5c0",
    "id": null,
    "metadata": {},
    "name": "useBAIUserEntitySourceQuery",
    "operationKind": "query",
    "text": "query useBAIUserEntitySourceQuery(\n  $filter: String\n  $first: Int!\n) {\n  user_nodes(filter: $filter, first: $first, order: \"email\") {\n    edges {\n      node {\n        id\n        email\n        full_name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4d68187d7764d9068d5af551942a7b0";

export default node;
