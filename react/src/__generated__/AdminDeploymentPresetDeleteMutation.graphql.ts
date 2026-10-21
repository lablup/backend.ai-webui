/**
 * @generated SignedSource<<458600110745825617bbcf155eac657f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetDeleteMutation$variables = {
  id: string;
};
export type AdminDeploymentPresetDeleteMutation$data = {
  readonly purgeDeploymentRevisionPreset: {
    readonly entityId: string;
  };
};
export type AdminDeploymentPresetDeleteMutation = {
  response: AdminDeploymentPresetDeleteMutation$data;
  variables: AdminDeploymentPresetDeleteMutation$variables;
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
    "concreteType": "PurgeDeploymentRevisionPresetPayload",
    "kind": "LinkedField",
    "name": "purgeDeploymentRevisionPreset",
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
    "name": "AdminDeploymentPresetDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "402d79e555ab97617d97713ea60712c9",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetDeleteMutation(\n  $id: UUID!\n) {\n  purgeDeploymentRevisionPreset(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "ff998942d06a862dcafadbaf41ad9be2";

export default node;
