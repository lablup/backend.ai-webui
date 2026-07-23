/**
 * @generated SignedSource<<8e86e554628f7a4ca280fc4c8f233541>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectBulkEditModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIProjectBulkEditModalStoriesQuery$data = {
  readonly group_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIProjectBulkEditModalFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIProjectBulkEditModalStoriesQuery = {
  response: BAIProjectBulkEditModalStoriesQuery$data;
  variables: BAIProjectBulkEditModalStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 3
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectBulkEditModalStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIProjectBulkEditModalFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "group_nodes(first:3,offset:0)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIProjectBulkEditModalStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "group_nodes(first:3,offset:0)"
      }
    ]
  },
  "params": {
    "cacheID": "e95e83787e4e85b2c9d30b1fe5e4d330",
    "id": null,
    "metadata": {},
    "name": "BAIProjectBulkEditModalStoriesQuery",
    "operationKind": "query",
    "text": "query BAIProjectBulkEditModalStoriesQuery {\n  group_nodes(offset: 0, first: 3) {\n    edges {\n      node {\n        ...BAIProjectBulkEditModalFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIProjectBulkEditModalFragment on GroupNode {\n  name\n  row_id\n}\n"
  }
};
})();

(node as any).hash = "99a682fa622f83ed529364e1a889fbda";

export default node;
