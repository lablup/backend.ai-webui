/**
 * @generated SignedSource<<187fa4a7aefa20d4ab09650da6e59be6>>
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
export type DeploymentListPageDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type DeploymentListPageDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentListPageDeleteMutation = {
  response: DeploymentListPageDeleteMutation$data;
  variables: DeploymentListPageDeleteMutation$variables;
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
    "name": "DeploymentListPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentListPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4639cd2572faeb586296319d8202e23a",
    "id": null,
    "metadata": {},
    "name": "DeploymentListPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentListPageDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "867cc2a31d2fc3342a0bafe7502c0483";

export default node;
