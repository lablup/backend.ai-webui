/**
 * @generated SignedSource<<46a2cecaf42fdf9b6d05174ebe6a4ad1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderNodesV2UsageQuery$variables = {
  vfolderId: string;
};
export type VFolderNodesV2UsageQuery$data = {
  readonly vfolderV2: {
    readonly id: string;
    readonly usage: {
      readonly numFiles: number;
      readonly usedBytes: {
        readonly expr: string;
      };
    } | null | undefined;
  } | null | undefined;
};
export type VFolderNodesV2UsageQuery = {
  response: VFolderNodesV2UsageQuery$data;
  variables: VFolderNodesV2UsageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "VFolder",
    "kind": "LinkedField",
    "name": "vfolderV2",
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
        "concreteType": "VFolderUsageInfo",
        "kind": "LinkedField",
        "name": "usage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "numFiles",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "BinarySizeInfo",
            "kind": "LinkedField",
            "name": "usedBytes",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "expr",
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
    "name": "VFolderNodesV2UsageQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderNodesV2UsageQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "99baab5688441171e806c5853ea8e31b",
    "id": null,
    "metadata": {},
    "name": "VFolderNodesV2UsageQuery",
    "operationKind": "query",
    "text": "query VFolderNodesV2UsageQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    usage {\n      numFiles\n      usedBytes {\n        expr @since(version: \"26.8.0\")\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a318324448cb328870c6cc8549363004";

export default node;
