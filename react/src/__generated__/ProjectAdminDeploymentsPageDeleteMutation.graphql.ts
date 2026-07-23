/**
 * @generated SignedSource<<9dc7cf8e6ca2a689af1276aa6470c42d>>
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
export type ProjectAdminDeploymentsPageDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type ProjectAdminDeploymentsPageDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type ProjectAdminDeploymentsPageDeleteMutation = {
  response: ProjectAdminDeploymentsPageDeleteMutation$data;
  variables: ProjectAdminDeploymentsPageDeleteMutation$variables;
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
    "name": "ProjectAdminDeploymentsPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectAdminDeploymentsPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1463ddcf31aa971e7f72ca3901c5db76",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminDeploymentsPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminDeploymentsPageDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "42ff73332d0c41e5828ba82d49920b78";

export default node;
