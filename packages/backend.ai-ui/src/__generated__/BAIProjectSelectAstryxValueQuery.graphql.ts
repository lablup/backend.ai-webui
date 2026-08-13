/**
 * @generated SignedSource<<901221ab341702d143c73aa96d320015>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSelectAstryxValueQuery$variables = {
  first: number;
  selectedFilter?: string | null | undefined;
  skipSelected: boolean;
};
export type BAIProjectSelectAstryxValueQuery$data = {
  readonly group_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIProjectSelectAstryxValueQuery = {
  response: BAIProjectSelectAstryxValueQuery$data;
  variables: BAIProjectSelectAstryxValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipSelected"
},
v3 = [
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
            "variableName": "selectedFilter"
          },
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "first"
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
    ]
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
    "name": "BAIProjectSelectAstryxValueQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIProjectSelectAstryxValueQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "cf74fc2b15b5f75bafd8a5970867a7c1",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIProjectSelectAstryxValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $skipSelected: Boolean!\n) {\n  group_nodes(filter: $selectedFilter, first: $first, permission: \"read_attribute\") @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dd99f4f42fa5d3e6d6b19f31d2b652bb";

export default node;
