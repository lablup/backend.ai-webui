/**
 * @generated SignedSource<<4ef3e840c2f6b50e6e83caf2c46533c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type StorageHostSettingsPanelDeleteUserResourcePolicyMutation$variables = {
  name: string;
};
export type StorageHostSettingsPanelDeleteUserResourcePolicyMutation$data = {
  readonly delete_user_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type StorageHostSettingsPanelDeleteUserResourcePolicyMutation = {
  response: StorageHostSettingsPanelDeleteUserResourcePolicyMutation$data;
  variables: StorageHostSettingsPanelDeleteUserResourcePolicyMutation$variables;
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
    "name": "StorageHostSettingsPanelDeleteUserResourcePolicyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostSettingsPanelDeleteUserResourcePolicyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5759d2afdfdd2ecdf6740cf5693025c8",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelDeleteUserResourcePolicyMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostSettingsPanelDeleteUserResourcePolicyMutation(\n  $name: String!\n) {\n  delete_user_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "7eabd260400640d0df671fc47ffc6b4a";

export default node;
