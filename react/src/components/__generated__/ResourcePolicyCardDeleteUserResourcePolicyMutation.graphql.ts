/**
 * @generated SignedSource<<60384f833d5b904ef5b1d6ce8336d83c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ResourcePolicyCardDeleteUserResourcePolicyMutation$variables = {
  name: string;
};
export type ResourcePolicyCardDeleteUserResourcePolicyMutation$data = {
  readonly delete_user_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type ResourcePolicyCardDeleteUserResourcePolicyMutation = {
  response: ResourcePolicyCardDeleteUserResourcePolicyMutation$data;
  variables: ResourcePolicyCardDeleteUserResourcePolicyMutation$variables;
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
    "concreteType": "DeleteUserResourcePolicy",
    "kind": "LinkedField",
    "name": "delete_user_resource_policy",
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
    "name": "ResourcePolicyCardDeleteUserResourcePolicyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePolicyCardDeleteUserResourcePolicyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "866fa07deddbd120ae4a79d26f086b6b",
    "id": null,
    "metadata": {},
    "name": "ResourcePolicyCardDeleteUserResourcePolicyMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePolicyCardDeleteUserResourcePolicyMutation(\n  $name: String!\n) {\n  delete_user_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "2db09b04ce563025a8bb046c7e313a1f";

export default node;
