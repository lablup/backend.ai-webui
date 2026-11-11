/**
 * @generated SignedSource<<16681bdb150a1b08ad6a6de7ee36a5e4>>
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
    readonly entityId: string;
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
            "name": "entityId",
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
    "cacheID": "4214ff207cb6641360fac2aa5a5cf176",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIRuntimeVariantSelectValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    entityId\n    name\n    readsVfolderConfigFiles @since(version: \"26.8.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "8037dc81ff8034d5163dd318c6bd5325";

export default node;
