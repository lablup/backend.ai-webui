/**
 * @generated SignedSource<<5dc5e5fcdf9e78e60bcf0026ada2595a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAvailablePresetSelectValueQuery$variables = {
  id: string;
  skip: boolean;
};
export type BAIAvailablePresetSelectValueQuery$data = {
  readonly deploymentRevisionPreset?: {
    readonly description: string | null | undefined;
    readonly id: string;
    readonly name: string;
    readonly runtimeVariant: {
      readonly name: string;
    } | null | undefined;
    readonly runtimeVariantId: string;
  } | null | undefined;
};
export type BAIAvailablePresetSelectValueQuery = {
  response: BAIAvailablePresetSelectValueQuery$data;
  variables: BAIAvailablePresetSelectValueQuery$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "runtimeVariantId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAvailablePresetSelectValueQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "DeploymentRevisionPreset",
            "kind": "LinkedField",
            "name": "deploymentRevisionPreset",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariant",
                "kind": "LinkedField",
                "name": "runtimeVariant",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAvailablePresetSelectValueQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "DeploymentRevisionPreset",
            "kind": "LinkedField",
            "name": "deploymentRevisionPreset",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariant",
                "kind": "LinkedField",
                "name": "runtimeVariant",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "92db865fe873b089a396a9d6da95e3e3",
    "id": null,
    "metadata": {},
    "name": "BAIAvailablePresetSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAvailablePresetSelectValueQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  deploymentRevisionPreset(id: $id) @skip(if: $skip) {\n    id\n    name\n    description\n    runtimeVariantId\n    runtimeVariant @since(version: \"26.4.3\") {\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fe30a86c0c706ac049c3b002751fc4de";

export default node;
