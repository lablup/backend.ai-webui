/**
 * @generated SignedSource<<33afad2de3b14117cf09c0c48b50c0d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectVfolderSelectAstryxValueQuery$variables = {
  skip: boolean;
  vfolderId: string;
};
export type BAIProjectVfolderSelectAstryxValueQuery$data = {
  readonly vfolderV2?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIProjectVfolderSelectAstryxValueQuery = {
  response: BAIProjectVfolderSelectAstryxValueQuery$data;
  variables: BAIProjectVfolderSelectAstryxValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
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
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
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
    ]
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
    "name": "BAIProjectVfolderSelectAstryxValueQuery",
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
    "name": "BAIProjectVfolderSelectAstryxValueQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "4947a5f5b9df91ee7e5bc039bd3f0a40",
    "id": null,
    "metadata": {},
    "name": "BAIProjectVfolderSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIProjectVfolderSelectAstryxValueQuery(\n  $vfolderId: UUID!\n  $skip: Boolean!\n) {\n  vfolderV2(vfolderId: $vfolderId) @skip(if: $skip) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "82873fedec6ed8392760bc211e720687";

export default node;
