/**
 * @generated SignedSource<<a8b7c1f3c6d22ba5d0ec1a6276e1eb6b>>
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
export type UpdateUsersModalMutation$variables = {
  email: string;
  props: ModifyUserInput;
};
export type UpdateUsersModalMutation$data = {
  readonly modify_user: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UpdateUsersModalMutation = {
  response: UpdateUsersModalMutation$data;
  variables: UpdateUsersModalMutation$variables;
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
    "name": "UpdateUsersModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UpdateUsersModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "be538ad11b2958697ead1ef50a1924cc",
    "id": null,
    "metadata": {},
    "name": "UpdateUsersModalMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateUsersModalMutation(\n  $email: String!\n  $props: ModifyUserInput!\n) {\n  modify_user(email: $email, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "0868256d1ec014157447373ca9b56f4e";

export default node;
