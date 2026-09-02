/**
 * @generated SignedSource<<3a3751084a9001fb28178d913533d939>>
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
export type DeploymentBasicInfoCardDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type DeploymentBasicInfoCardDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentBasicInfoCardDeleteMutation = {
  response: DeploymentBasicInfoCardDeleteMutation$data;
  variables: DeploymentBasicInfoCardDeleteMutation$variables;
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
    "name": "DeploymentBasicInfoCardDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentBasicInfoCardDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "70ed95e6d8ed42187398c9bc2c13f5bb",
    "id": null,
    "metadata": {},
    "name": "DeploymentBasicInfoCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentBasicInfoCardDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "219d6f05b61219aeb47beff89d87a769";

export default node;
