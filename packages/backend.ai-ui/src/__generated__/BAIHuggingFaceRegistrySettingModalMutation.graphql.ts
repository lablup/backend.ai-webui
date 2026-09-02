/**
 * @generated SignedSource<<4a07ac9c972ac9d1e8c0edd48a8be8d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateHuggingFaceRegistryInput = {
  id: string;
  name?: string | null | undefined;
  token?: string | null | undefined;
  url?: string | null | undefined;
};
export type BAIHuggingFaceRegistrySettingModalMutation$variables = {
  input: UpdateHuggingFaceRegistryInput;
};
export type BAIHuggingFaceRegistrySettingModalMutation$data = {
  readonly updateHuggingfaceRegistry: {
    readonly huggingfaceRegistry: {
      readonly id: string;
      readonly token: string | null | undefined;
    };
  } | null | undefined;
};
export type BAIHuggingFaceRegistrySettingModalMutation = {
  response: BAIHuggingFaceRegistrySettingModalMutation$data;
  variables: BAIHuggingFaceRegistrySettingModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateHuggingFaceRegistryPayload",
    "kind": "LinkedField",
    "name": "updateHuggingfaceRegistry",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "HuggingFaceRegistry",
        "kind": "LinkedField",
        "name": "huggingfaceRegistry",
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
            "name": "token",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIHuggingFaceRegistrySettingModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIHuggingFaceRegistrySettingModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8c0a6f6d6fbbd8a239590789829c4c8a",
    "id": null,
    "metadata": {},
    "name": "BAIHuggingFaceRegistrySettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation BAIHuggingFaceRegistrySettingModalMutation(\n  $input: UpdateHuggingFaceRegistryInput!\n) {\n  updateHuggingfaceRegistry(input: $input) {\n    huggingfaceRegistry {\n      id\n      token\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d6a10c62d8fd3d9fb07a956858ec350d";

export default node;
