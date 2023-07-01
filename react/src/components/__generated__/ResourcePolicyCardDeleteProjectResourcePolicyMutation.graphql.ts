/**
 * @generated SignedSource<<fec9b28d260942adef5b812d7910e439>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ResourcePolicyCardDeleteProjectResourcePolicyMutation$variables = {
  name: string;
};
export type ResourcePolicyCardDeleteProjectResourcePolicyMutation$data = {
  readonly delete_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type ResourcePolicyCardDeleteProjectResourcePolicyMutation = {
  response: ResourcePolicyCardDeleteProjectResourcePolicyMutation$data;
  variables: ResourcePolicyCardDeleteProjectResourcePolicyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "DeleteProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "delete_project_resource_policy",
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
    "name": "ResourcePolicyCardDeleteProjectResourcePolicyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePolicyCardDeleteProjectResourcePolicyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "73d84defbefa3dc36577fd8d899dbc8c",
    "id": null,
    "metadata": {},
    "name": "ResourcePolicyCardDeleteProjectResourcePolicyMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePolicyCardDeleteProjectResourcePolicyMutation(\n  $name: String!\n) {\n  delete_project_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "673819985cc85588d4b8c57283f5dfff";

export default node;
