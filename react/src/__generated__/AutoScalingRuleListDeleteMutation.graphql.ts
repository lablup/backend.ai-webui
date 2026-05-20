/**
 * @generated SignedSource<<fafd6054548c2eecfcaa51634e7e4755>>
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
export type AutoScalingRuleListDeleteMutation$variables = {
  input: DeleteAutoScalingRuleInput;
};
export type AutoScalingRuleListDeleteMutation$data = {
  readonly deleteAutoScalingRule: {
    readonly id: string;
  } | null | undefined;
};
export type AutoScalingRuleListDeleteMutation = {
  response: AutoScalingRuleListDeleteMutation$data;
  variables: AutoScalingRuleListDeleteMutation$variables;
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
    "name": "AutoScalingRuleListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "84fac37f17347340ba1f6a7991bc3624",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleListDeleteMutation(\n  $input: DeleteAutoScalingRuleInput!\n) {\n  deleteAutoScalingRule(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c0d22df767771306d1fc0a431e5d177b";

export default node;
