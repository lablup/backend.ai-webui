/**
 * @generated SignedSource<<b7d4362b819cd943b7b658b39f4ade88>>
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
    readonly id: string;
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
    "concreteType": "DeleteDeploymentRevisionPresetPayload",
    "kind": "LinkedField",
    "name": "purgeDeploymentRevisionPreset",
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
    "cacheID": "ee50a60d493fc76adc25037006f7260e",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetDeleteMutation(\n  $id: UUID!\n) {\n  purgeDeploymentRevisionPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "512556a3a79b1351f35a8bf3e73b26b5";

export default node;
