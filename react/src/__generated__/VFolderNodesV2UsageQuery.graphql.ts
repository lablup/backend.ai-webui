/**
 * @generated SignedSource<<c88d01a0a1b6de1e5264a3c8c866a5c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderNodesV2UsageQuery$variables = {
  supportsBinarySizeExpr: boolean;
  vfolderId: string;
};
export type VFolderNodesV2UsageQuery$data = {
  readonly vfolderV2: {
    readonly id: string;
    readonly usage: {
      readonly numFiles: number;
      readonly usedBytes: {
        readonly display: string;
        readonly expr?: string;
      };
    } | null | undefined;
  } | null | undefined;
};
export type VFolderNodesV2UsageQuery = {
  response: VFolderNodesV2UsageQuery$data;
  variables: VFolderNodesV2UsageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsBinarySizeExpr"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
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
                "name": "display",
                "storageKey": null
              },
              {
                "condition": "supportsBinarySizeExpr",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "expr",
                    "storageKey": null
                  }
                ]
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodesV2UsageQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "VFolderNodesV2UsageQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "57c118e1cb977ed66865011972d3ec8d",
    "id": null,
    "metadata": {},
    "name": "VFolderNodesV2UsageQuery",
    "operationKind": "query",
    "text": "query VFolderNodesV2UsageQuery(\n  $vfolderId: UUID!\n  $supportsBinarySizeExpr: Boolean!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    usage {\n      numFiles\n      usedBytes {\n        display\n        expr @include(if: $supportsBinarySizeExpr) @since(version: \"26.8.0\")\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "45a10ad928e2270c88894fd0698126d3";

export default node;
