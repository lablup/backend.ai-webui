/**
 * @generated SignedSource<<ef2b84c796fc72698452daeb66c010af>>
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
    "cacheID": "0444466fd782d21e1ab59599ab4b63e0",
    "id": null,
    "metadata": {},
    "name": "VFolderNodesV2UsageQuery",
    "operationKind": "query",
    "text": "query VFolderNodesV2UsageQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    usage {\n      numFiles\n      usedBytes {\n        expr\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a2651b50a7049d45a52fa6663eea2f2";

export default node;
