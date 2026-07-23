/**
 * @generated SignedSource<<b316d7a45e9f3aaf00ffd629ca2b70f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectVfolderSelectValueQuery$variables = {
  skip: boolean;
  vfolderId: string;
};
export type BAIProjectVfolderSelectValueQuery$data = {
  readonly vfolderV2?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIProjectVfolderSelectValueQuery = {
  response: BAIProjectVfolderSelectValueQuery$data;
  variables: BAIProjectVfolderSelectValueQuery$variables;
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
    "name": "BAIProjectVfolderSelectValueQuery",
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
    "name": "BAIProjectVfolderSelectValueQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "cdf5dad5b8fe85a508be77092a741eae",
    "id": null,
    "metadata": {},
    "name": "BAIProjectVfolderSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIProjectVfolderSelectValueQuery(\n  $vfolderId: UUID!\n  $skip: Boolean!\n) {\n  vfolderV2(vfolderId: $vfolderId) @skip(if: $skip) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2a976a5a7ce24567a081ca8c63c0785d";

export default node;
