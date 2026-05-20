/**
 * @generated SignedSource<<db83a58f39ebd9be1e4647069d56a440>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyUserInput = {
  allowed_client_ip?: ReadonlyArray<string | null | undefined> | null | undefined;
  container_gids?: ReadonlyArray<number | null | undefined> | null | undefined;
  container_main_gid?: number | null | undefined;
  container_uid?: number | null | undefined;
  description?: string | null | undefined;
  domain_name?: string | null | undefined;
  full_name?: string | null | undefined;
  group_ids?: ReadonlyArray<string | null | undefined> | null | undefined;
  is_active?: boolean | null | undefined;
  main_access_key?: string | null | undefined;
  need_password_change?: boolean | null | undefined;
  password?: string | null | undefined;
  resource_policy?: string | null | undefined;
  role?: string | null | undefined;
  status?: string | null | undefined;
  sudo_session_enabled?: boolean | null | undefined;
  totp_activated?: boolean | null | undefined;
  username?: string | null | undefined;
};
export type UserManagementModifyMutation$variables = {
  email: string;
  props: ModifyUserInput;
};
export type UserManagementModifyMutation$data = {
  readonly modify_user: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserManagementModifyMutation = {
  response: UserManagementModifyMutation$data;
  variables: UserManagementModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
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
        "name": "email",
        "variableName": "email"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyUser",
    "kind": "LinkedField",
    "name": "modify_user",
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
    "name": "UserManagementModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserManagementModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "cd14b770d01d9b6e13257faa0f84f3cd",
    "id": null,
    "metadata": {},
    "name": "UserManagementModifyMutation",
    "operationKind": "mutation",
    "text": "mutation UserManagementModifyMutation(\n  $email: String!\n  $props: ModifyUserInput!\n) {\n  modify_user(email: $email, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebfe36ddd47871027ed7d1e84b98c347";

export default node;
