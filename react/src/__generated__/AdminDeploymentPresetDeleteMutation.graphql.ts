/**
 * @generated SignedSource<<0d6ed3264e903db10a5568bf8035f68d>>
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
  readonly adminDeleteDeploymentRevisionPreset: {
    readonly id: string;
  } | null | undefined;
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
    "cacheID": "9802c9f782ff33a151e9214c57ff7bc1",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetDeleteMutation(\n  $id: UUID!\n) {\n  adminDeleteDeploymentRevisionPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "47a4cad7e6f8ed1b0d096523f1b3aadf";

export default node;
