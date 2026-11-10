/**
 * @generated SignedSource<<3c7a93f5a548dfb1e5b6ceb9ab67cd8c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderNodeSelectValueQuery$variables = {
  first: number;
  scopeId?: any | null | undefined;
  selectedFilter?: string | null | undefined;
  skipSelectedVFolder: boolean;
};
export type BAIVFolderNodeSelectValueQuery$data = {
  readonly vfolder_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIVFolderNodeSelectValueQuery = {
  response: BAIVFolderNodeSelectValueQuery$data;
  variables: BAIVFolderNodeSelectValueQuery$variables;
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
  "name": "scopeId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipSelectedVFolder"
},
v4 = [
  {
    "condition": "skipSelectedVFolder",
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
          },
          {
            "kind": "Variable",
            "name": "scope_id",
            "variableName": "scopeId"
          }
        ],
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VirtualFolderNode",
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
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
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
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIVFolderNodeSelectValueQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIVFolderNodeSelectValueQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "90e4600ebe0ea812f01acd5cc1c0a8ad",
    "id": null,
    "metadata": {},
    "name": "BAIVFolderNodeSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIVFolderNodeSelectValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $skipSelectedVFolder: Boolean!\n  $scopeId: ScopeField\n) {\n  vfolder_nodes(scope_id: $scopeId, filter: $selectedFilter, first: $first, permission: \"read_attribute\") @skip(if: $skipSelectedVFolder) {\n    edges {\n      node {\n        name\n        id\n        row_id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7b97bd2553bc9563024c3f640662f3b9";

export default node;
