/**
 * @generated SignedSource<<f486138a2ce6f6e589ec58cb7aed6fe2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectValueQuery$variables = {
  first: number;
  selectedFilter?: string | null | undefined;
  skipSelected: boolean;
};
export type BAIUserSelectValueQuery$data = {
  readonly user_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly email: string | null | undefined;
        readonly id: string;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIUserSelectValueQuery = {
  response: BAIUserSelectValueQuery$data;
  variables: BAIUserSelectValueQuery$variables;
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
    "name": "BAIUserSelectValueQuery",
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
    "name": "BAIUserSelectValueQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "b68889d74486fd728e33b9d42400118d",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $skipSelected: Boolean!\n) {\n  user_nodes(filter: $selectedFilter, first: $first) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        email\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "afc220428cd56d4a9ca22f44594ee0a4";

export default node;
