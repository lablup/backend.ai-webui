/**
 * @generated SignedSource<<1453f4e77362c5be01ae71c6e23a90ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteDeploymentInput = {
  id: string;
};
export type AdminDeploymentDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type AdminDeploymentDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type AdminDeploymentDeleteMutation = {
  response: AdminDeploymentDeleteMutation$data;
  variables: AdminDeploymentDeleteMutation$variables;
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
    "concreteType": "DeleteDeploymentPayload",
    "kind": "LinkedField",
    "name": "deleteModelDeployment",
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
    "name": "AdminDeploymentDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6c4d5e089de8847855a360c25b91855b",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "85eb1c4f21f817def12acb84acc36a46";

export default node;
