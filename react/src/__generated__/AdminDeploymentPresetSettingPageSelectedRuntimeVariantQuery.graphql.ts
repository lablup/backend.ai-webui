/**
 * @generated SignedSource<<61f969690b217942ef7b4885a8a2f82d>>
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
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
  "name": "readsVfolderConfigFiles",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "RuntimeVariant",
            "kind": "LinkedField",
            "name": "runtimeVariant",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/)
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
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "RuntimeVariant",
            "kind": "LinkedField",
            "name": "runtimeVariant",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
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
    "cacheID": "fefd4dd17283aa04d452bd8f07bd1ed3",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    entityId\n    name\n    readsVfolderConfigFiles @since(version: \"26.8.0\")\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "cbae4b2efbd76213d92f67dd4edbb09a";

export default node;
