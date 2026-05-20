/**
 * @generated SignedSource<<2dcc27e935b6323ce19c277b80885e50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetListPageDeleteMutation$variables = {
  id: string;
};
export type AdminDeploymentPresetListPageDeleteMutation$data = {
  readonly adminDeleteDeploymentRevisionPreset: {
    readonly id: string;
  } | null | undefined;
};
export type AdminDeploymentPresetListPageDeleteMutation = {
  response: AdminDeploymentPresetListPageDeleteMutation$data;
  variables: AdminDeploymentPresetListPageDeleteMutation$variables;
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
    "concreteType": "DeleteDeploymentRevisionPresetPayloadGQL",
    "kind": "LinkedField",
    "name": "adminDeleteDeploymentRevisionPreset",
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
    "name": "AdminDeploymentPresetListPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetListPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a6ffc9daa5a94f63ada52181190a4eeb",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetListPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetListPageDeleteMutation(\n  $id: UUID!\n) {\n  adminDeleteDeploymentRevisionPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef6932db52137481429545d0abf749fe";

export default node;
