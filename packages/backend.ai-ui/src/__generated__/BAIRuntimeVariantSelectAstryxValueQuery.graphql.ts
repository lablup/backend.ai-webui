/**
 * @generated SignedSource<<38893cc540d35d53649bd6257221ace2>>
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
    "cacheID": "a69d6f121f987897e9c2abe0eff59bf7",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIRuntimeVariantSelectAstryxValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "563575d221cdb97fb76a3013937b4537";

export default node;
