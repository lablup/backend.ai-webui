/**
 * @generated SignedSource<<e5c6df598969cf171cc9756e7543917f>>
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
    readonly readsVfolderConfigFiles: boolean;
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
    "cacheID": "2a822235c81302b2cbd0d4a3eee411ff",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIRuntimeVariantSelectValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    name\n    readsVfolderConfigFiles @since(version: \"26.8.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "31a6b79681e2665e15af3d38135c04ad";

export default node;
