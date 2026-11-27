/**
 * @generated SignedSource<<eed05efb798345b010778370968544b2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminRuntimeVariantPresetDeleteMutation$variables = {
  id: string;
};
export type AdminRuntimeVariantPresetDeleteMutation$data = {
  readonly purgeRuntimeVariantPreset: {
    readonly entityId: string;
  };
};
export type AdminRuntimeVariantPresetDeleteMutation = {
  response: AdminRuntimeVariantPresetDeleteMutation$data;
  variables: AdminRuntimeVariantPresetDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "PurgeRuntimeVariantPresetPayload",
    "kind": "LinkedField",
    "name": "purgeRuntimeVariantPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
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
    "name": "AdminRuntimeVariantPresetDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminRuntimeVariantPresetDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "836ecbc585bf8553944a72adf96c27a3",
    "id": null,
    "metadata": {},
    "name": "AdminRuntimeVariantPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminRuntimeVariantPresetDeleteMutation(\n  $id: UUID!\n) {\n  purgeRuntimeVariantPreset(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "b8fb3df94163417520958ae08b1b4c97";

export default node;
