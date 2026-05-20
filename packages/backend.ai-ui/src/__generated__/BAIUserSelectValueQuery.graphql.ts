/**
 * @generated SignedSource<<ec42156f5a3980f83354f737c87e7e8b>>
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
        readonly full_name: string | null | undefined;
        readonly id: string;
        readonly username: string | null | undefined;
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
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
    "cacheID": "892012c3d881eec8e740e86423b3082a",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $skipSelected: Boolean!\n) {\n  user_nodes(filter: $selectedFilter, first: $first) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        email\n        username\n        full_name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eb527953b7f48f764c68dead9065ed50";

export default node;
