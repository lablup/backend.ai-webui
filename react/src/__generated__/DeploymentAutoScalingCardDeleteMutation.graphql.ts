/**
 * @generated SignedSource<<23099bde65b87f4412e478f65f452d1a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteAutoScalingRuleInput = {
  id: string;
};
export type DeploymentAutoScalingCardDeleteMutation$variables = {
  input: DeleteAutoScalingRuleInput;
};
export type DeploymentAutoScalingCardDeleteMutation$data = {
  readonly deleteAutoScalingRule: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentAutoScalingCardDeleteMutation = {
  response: DeploymentAutoScalingCardDeleteMutation$data;
  variables: DeploymentAutoScalingCardDeleteMutation$variables;
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
    "concreteType": "DeleteAutoScalingRulePayload",
    "kind": "LinkedField",
    "name": "deleteAutoScalingRule",
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
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1b7b8f1adf6afd81d338607d63841181",
    "id": null,
    "metadata": {},
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAutoScalingCardDeleteMutation(\n  $input: DeleteAutoScalingRuleInput!\n) {\n  deleteAutoScalingRule(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "051eb6f0b4919363bd328fca5366d60b";

export default node;
