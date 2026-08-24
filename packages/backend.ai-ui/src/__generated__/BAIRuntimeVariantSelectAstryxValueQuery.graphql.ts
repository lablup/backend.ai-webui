/**
 * @generated SignedSource<<f093ad65da3f42c0dfde0c95bf5d19f6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIRuntimeVariantSelectAstryxValueQuery$variables = {
  id: string;
  skip: boolean;
};
export type BAIRuntimeVariantSelectAstryxValueQuery$data = {
  readonly runtimeVariant?: {
    readonly id: string;
    readonly name: string;
    readonly readsVfolderConfigFiles: boolean;
  } | null | undefined;
};
export type BAIRuntimeVariantSelectAstryxValueQuery = {
  response: BAIRuntimeVariantSelectAstryxValueQuery$data;
  variables: BAIRuntimeVariantSelectAstryxValueQuery$variables;
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
    "name": "skip"
  }
],
v1 = [
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
            "name": "id",
            "variableName": "id"
          }
        ],
        "concreteType": "RuntimeVariant",
        "kind": "LinkedField",
        "name": "runtimeVariant",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "readsVfolderConfigFiles",
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
    "name": "BAIRuntimeVariantSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIRuntimeVariantSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b5d8b89f912aded0ac4b7ef8d6f52ab5",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIRuntimeVariantSelectAstryxValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    name\n    readsVfolderConfigFiles @since(version: \"26.8.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd4eee3f426e3f5988ae177fc1d3d8b0";

export default node;
