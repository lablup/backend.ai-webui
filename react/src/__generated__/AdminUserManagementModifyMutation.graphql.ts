/**
 * @generated SignedSource<<4ffd69aee965725f1f615c4260ccc4de>>
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
export type AdminUserManagementModifyMutation$variables = {
  email: string;
  props: ModifyUserInput;
};
export type AdminUserManagementModifyMutation$data = {
  readonly modify_user: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type AdminUserManagementModifyMutation = {
  response: AdminUserManagementModifyMutation$data;
  variables: AdminUserManagementModifyMutation$variables;
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
    "name": "AdminUserManagementModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminUserManagementModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1daa76c8ec6e59c7ad8229984377932b",
    "id": null,
    "metadata": {},
    "name": "AdminUserManagementModifyMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserManagementModifyMutation(\n  $email: String!\n  $props: ModifyUserInput!\n) {\n  modify_user(email: $email, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "58e2becf792ef50bfc12eebea962154d";

export default node;
