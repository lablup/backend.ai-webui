/**
 * @generated SignedSource<<4203cade1d1e6cdecc595e66fbb9f422>>
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
  readonly adminDeleteRuntimeVariantPreset: {
    readonly id: string;
  } | null | undefined;
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
    "concreteType": "DeleteRuntimeVariantPresetPayload",
    "kind": "LinkedField",
    "name": "adminDeleteRuntimeVariantPreset",
    "plural": false,
    "selections": [
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
    "cacheID": "7948d8a5420aac162ee03e43a884e5a8",
    "id": null,
    "metadata": {},
    "name": "AdminRuntimeVariantPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminRuntimeVariantPresetDeleteMutation(\n  $id: UUID!\n) {\n  adminDeleteRuntimeVariantPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "15f5f89aac3092914ffa818fd0e3d9d1";

export default node;
