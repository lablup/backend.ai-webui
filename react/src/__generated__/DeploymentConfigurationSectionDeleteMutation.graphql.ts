/**
 * @generated SignedSource<<ed436f8481c3be81112d6a4a1e85d1bc>>
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
export type DeploymentConfigurationSectionDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type DeploymentConfigurationSectionDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentConfigurationSectionDeleteMutation = {
  response: DeploymentConfigurationSectionDeleteMutation$data;
  variables: DeploymentConfigurationSectionDeleteMutation$variables;
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
    "name": "DeploymentConfigurationSectionDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentConfigurationSectionDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ccb2e618fc149ec819f2dbee3d35c7a1",
    "id": null,
    "metadata": {},
    "name": "DeploymentConfigurationSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentConfigurationSectionDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "739b8de15b5a7bdec89ece3d8628621f";

export default node;
