/**
 * @generated SignedSource<<f28d60d814e5a30fe003eb9319f68a0f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIObjectStorageSelectValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIObjectStorageSelectValueQuery$data = {
  readonly objectStorage?: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type BAIObjectStorageSelectValueQuery = {
  response: BAIObjectStorageSelectValueQuery$data;
  variables: BAIObjectStorageSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
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
            "name": "id",
            "variableName": "id"
          }
        ],
        "concreteType": "ObjectStorage",
        "kind": "LinkedField",
        "name": "objectStorage",
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
            "name": "name",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIObjectStorageSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIObjectStorageSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "55840e1a2dc1c4df9adfb2af80f5e170",
    "id": null,
    "metadata": {},
    "name": "BAIObjectStorageSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIObjectStorageSelectValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  objectStorage(id: $id) @skip(if: $skipSelected) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "039f4cd3cd00bc11ea54b0c8c2c82b33";

export default node;
