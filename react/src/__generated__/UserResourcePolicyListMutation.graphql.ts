/**
 * @generated SignedSource<<305f7843659d8f0fe03b1b010a8f6ac4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicyListMutation$variables = {
  name: string;
};
export type UserResourcePolicyListMutation$data = {
  readonly delete_user_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserResourcePolicyListMutation = {
  response: UserResourcePolicyListMutation$data;
  variables: UserResourcePolicyListMutation$variables;
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
    "name": "UserResourcePolicyListMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicyListMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7be7fa4bc2e6ce7666489318e415d769",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyListMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyListMutation(\n  $name: String!\n) {\n  delete_user_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b565e4db37c96850ac85a92cd4e0290";

export default node;
