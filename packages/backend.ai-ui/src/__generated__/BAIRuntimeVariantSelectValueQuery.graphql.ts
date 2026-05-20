/**
 * @generated SignedSource<<910197ccc553214d04740948f3ce1588>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIRuntimeVariantSelectValueQuery$variables = {
  id: string;
  skip: boolean;
};
export type BAIRuntimeVariantSelectValueQuery$data = {
  readonly runtimeVariant?: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type BAIRuntimeVariantSelectValueQuery = {
  response: BAIRuntimeVariantSelectValueQuery$data;
  variables: BAIRuntimeVariantSelectValueQuery$variables;
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
    "name": "BAIRuntimeVariantSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIRuntimeVariantSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f029b9c8b12e9bc799f1ff1caaebd031",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIRuntimeVariantSelectValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "f7c1435633aeb06ecc9eafe324f06550";

export default node;
