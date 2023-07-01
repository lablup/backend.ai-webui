/**
 * @generated SignedSource<<bea84757b131fab45e7ddab986f56800>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateUserResourcePolicyInput = {
  max_vfolder_size: any;
};
export type UserResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateUserResourcePolicyInput;
};
export type UserResourcePolicySettingModalCreateMutation$data = {
  readonly create_user_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
    readonly resource_policy: {
      readonly max_vfolder_size: any | null;
    } | null;
  } | null;
};
export type UserResourcePolicySettingModalCreateMutation = {
  response: UserResourcePolicySettingModalCreateMutation$data;
  variables: UserResourcePolicySettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
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
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "CreateUserResourcePolicy",
    "kind": "LinkedField",
    "name": "create_user_resource_policy",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "resource_policy",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_vfolder_size",
            "storageKey": null
          }
        ],
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
    "name": "UserResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4a3be550849e48eea509656b8e21cefd",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateUserResourcePolicyInput!\n) {\n  create_user_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n    resource_policy {\n      max_vfolder_size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "72d37eb1ea7d8204010443f404c627eb";

export default node;
