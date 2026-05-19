/**
 * @generated SignedSource<<c4cd915467f36b8749182c38fb4cdcee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingRuleListLegacyDeleteMutation$variables = {
  id: string;
};
export type AutoScalingRuleListLegacyDeleteMutation$data = {
  readonly delete_endpoint_auto_scaling_rule_node: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type AutoScalingRuleListLegacyDeleteMutation = {
  response: AutoScalingRuleListLegacyDeleteMutation$data;
  variables: AutoScalingRuleListLegacyDeleteMutation$variables;
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
    "concreteType": "DeleteEndpointAutoScalingRuleNode",
    "kind": "LinkedField",
    "name": "delete_endpoint_auto_scaling_rule_node",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "AutoScalingRuleListLegacyDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleListLegacyDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "715a2390c5f6c08f29900f3a96198134",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleListLegacyDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleListLegacyDeleteMutation(\n  $id: String!\n) {\n  delete_endpoint_auto_scaling_rule_node(id: $id) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "c52bb0e1e6bcbdb3c48045e1e2ea4695";

export default node;
