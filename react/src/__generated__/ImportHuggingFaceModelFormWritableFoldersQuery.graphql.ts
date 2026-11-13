/**
 * @generated SignedSource<<d97d9c858cf9d404ddd2dc2c3ce3d5c6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportHuggingFaceModelFormWritableFoldersQuery$variables = {
  filter?: string | null | undefined;
  first: number;
  scopeId?: any | null | undefined;
};
export type ImportHuggingFaceModelFormWritableFoldersQuery$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ImportHuggingFaceModelFormWritableFoldersQuery = {
  response: ImportHuggingFaceModelFormWritableFoldersQuery$data;
  variables: ImportHuggingFaceModelFormWritableFoldersQuery$variables;
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
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v3 = [
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
    "name": "permission",
    "value": "mount_rw"
  },
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "scopeId"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportHuggingFaceModelFormWritableFoldersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImportHuggingFaceModelFormWritableFoldersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
                  (v4/*: any*/),
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bb62f91e601111e33ad8da684554c29b",
    "id": null,
    "metadata": {},
    "name": "ImportHuggingFaceModelFormWritableFoldersQuery",
    "operationKind": "query",
    "text": "query ImportHuggingFaceModelFormWritableFoldersQuery(\n  $scopeId: ScopeField\n  $filter: String\n  $first: Int!\n) {\n  vfolder_nodes(scope_id: $scopeId, permission: \"mount_rw\", filter: $filter, first: $first) {\n    edges {\n      node {\n        row_id\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eef7dd6cb729ffafcce83cb5d46e7c91";

export default node;
