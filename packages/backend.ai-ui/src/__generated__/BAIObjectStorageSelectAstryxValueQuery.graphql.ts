/**
 * @generated SignedSource<<e273b1c0126d237dfbc90be4c9edb19f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIObjectStorageSelectAstryxValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIObjectStorageSelectAstryxValueQuery$data = {
  readonly objectStorage?: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type BAIObjectStorageSelectAstryxValueQuery = {
  response: BAIObjectStorageSelectAstryxValueQuery$data;
  variables: BAIObjectStorageSelectAstryxValueQuery$variables;
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
    "name": "BAIObjectStorageSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIObjectStorageSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3102cc2567319ebc0060ce7a45e69f9b",
    "id": null,
    "metadata": {},
    "name": "BAIObjectStorageSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIObjectStorageSelectAstryxValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  objectStorage(id: $id) @skip(if: $skipSelected) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "940c9c1ba9d2728118eb3ddd42aebc1b";

export default node;
