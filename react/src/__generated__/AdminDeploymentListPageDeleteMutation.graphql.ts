/**
 * @generated SignedSource<<e2b0d12e9ee241317cf98b6b287954f0>>
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
export type AdminDeploymentListPageDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type AdminDeploymentListPageDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type AdminDeploymentListPageDeleteMutation = {
  response: AdminDeploymentListPageDeleteMutation$data;
  variables: AdminDeploymentListPageDeleteMutation$variables;
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
    "name": "AdminDeploymentListPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentListPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "102d0bf1e8e60917d9d011759a41790c",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentListPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentListPageDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2ecece6de837bfaf9eb7065300b85fba";

export default node;
