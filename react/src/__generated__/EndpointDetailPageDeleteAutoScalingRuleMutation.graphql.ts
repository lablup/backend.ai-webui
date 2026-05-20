/**
 * @generated SignedSource<<1fc9d9364647dff245183bb13c154889>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EndpointDetailPageDeleteAutoScalingRuleMutation$variables = {
  id: string;
};
export type EndpointDetailPageDeleteAutoScalingRuleMutation$data = {
  readonly delete_endpoint_auto_scaling_rule_node: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type EndpointDetailPageDeleteAutoScalingRuleMutation = {
  response: EndpointDetailPageDeleteAutoScalingRuleMutation$data;
  variables: EndpointDetailPageDeleteAutoScalingRuleMutation$variables;
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
    "name": "EndpointDetailPageDeleteAutoScalingRuleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EndpointDetailPageDeleteAutoScalingRuleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "141673b2caa5030c858d5c34dc35cd93",
    "id": null,
    "metadata": {},
    "name": "EndpointDetailPageDeleteAutoScalingRuleMutation",
    "operationKind": "mutation",
    "text": "mutation EndpointDetailPageDeleteAutoScalingRuleMutation(\n  $id: String!\n) {\n  delete_endpoint_auto_scaling_rule_node(id: $id) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "96e87d78000feddb6607f4bdbcdc14cb";

export default node;
