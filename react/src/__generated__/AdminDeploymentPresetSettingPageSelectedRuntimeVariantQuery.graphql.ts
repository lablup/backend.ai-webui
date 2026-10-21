/**
 * @generated SignedSource<<94b8e29344800745b1f20fec8870cb01>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery$variables = {
  id: string;
  skip: boolean;
};
export type AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery$data = {
  readonly runtimeVariant?: {
    readonly entityId: string;
    readonly id: string;
    readonly name: string;
    readonly readsVfolderConfigFiles: boolean;
  } | null | undefined;
};
export type AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery = {
  response: AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery$data;
  variables: AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery$variables;
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
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d50b2755fe254b0f8b2d44b087f38290",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    entityId\n    name\n    readsVfolderConfigFiles @since(version: \"26.8.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "f9816fbc885e33f43fdbb2fd00e093fd";

export default node;
