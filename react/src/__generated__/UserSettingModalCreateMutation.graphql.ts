/**
 * @generated SignedSource<<d7963c5bd2539e0355dd9884f2008faa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserInput = {
  allowed_client_ip?: ReadonlyArray<string | null | undefined> | null | undefined;
  container_gids?: ReadonlyArray<number | null | undefined> | null | undefined;
  container_main_gid?: number | null | undefined;
  container_uid?: number | null | undefined;
  description?: string | null | undefined;
  domain_name?: string;
  full_name?: string | null | undefined;
  group_ids?: ReadonlyArray<string | null | undefined> | null | undefined;
  is_active?: boolean | null | undefined;
  need_password_change: boolean;
  password: string;
  resource_policy?: string | null | undefined;
  role?: string | null | undefined;
  status?: string | null | undefined;
  sudo_session_enabled?: boolean | null | undefined;
  totp_activated?: boolean | null | undefined;
  username: string;
};
export type UserSettingModalCreateMutation$variables = {
  email: string;
  isNotSupportTotp: boolean;
  props: UserInput;
};
export type UserSettingModalCreateMutation$data = {
  readonly create_user: {
    readonly keypair: {
      readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
    } | null | undefined;
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
    readonly user: {
      readonly allowed_client_ip: ReadonlyArray<string | null | undefined> | null | undefined;
      readonly container_gids: ReadonlyArray<number | null | undefined> | null | undefined;
      readonly container_main_gid: number | null | undefined;
      readonly container_uid: number | null | undefined;
      readonly description: string | null | undefined;
      readonly domain_name: string | null | undefined;
      readonly email: string | null | undefined;
      readonly full_name: string | null | undefined;
      readonly groups: ReadonlyArray<{
        readonly id: string | null | undefined;
        readonly name: string | null | undefined;
      } | null | undefined> | null | undefined;
      readonly id: string | null | undefined;
      readonly main_access_key: string | null | undefined;
      readonly need_password_change: boolean | null | undefined;
      readonly resource_policy: string | null | undefined;
      readonly role: string | null | undefined;
      readonly status: string | null | undefined;
      readonly sudo_session_enabled: boolean | null | undefined;
      readonly totp_activated: boolean | null | undefined;
      readonly username: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"TOTPActivateModalFragment">;
    } | null | undefined;
  } | null | undefined;
};
export type UserSettingModalCreateMutation = {
  response: UserSettingModalCreateMutation$data;
  variables: UserSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "email"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isNotSupportTotp"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "props"
},
v3 = [
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msg",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "need_password_change",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "full_name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domain_name",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v6/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sudo_session_enabled",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totp_activated",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "allowed_client_ip",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "main_access_key",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_uid",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_main_gid",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_gids",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "CreateUser",
        "kind": "LinkedField",
        "name": "create_user",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              (v23/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "TOTPActivateModalFragment"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "GeneratedKeypairListModalFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "CreateUser",
        "kind": "LinkedField",
        "name": "create_user",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              (v23/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "access_key",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "secret_key",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "UserInfo",
                "kind": "LinkedField",
                "name": "user_info",
                "plural": false,
                "selections": [
                  (v7/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e2216aeec5b3a041ac90522ef40e9b90",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserSettingModalCreateMutation(\n  $email: String!\n  $props: UserInput!\n  $isNotSupportTotp: Boolean!\n) {\n  create_user(email: $email, props: $props) {\n    ok\n    msg\n    user {\n      id\n      email\n      username\n      need_password_change\n      full_name\n      description\n      status\n      domain_name\n      role\n      groups {\n        id\n        name\n      }\n      resource_policy\n      sudo_session_enabled\n      totp_activated @skipOnClient(if: $isNotSupportTotp)\n      allowed_client_ip\n      main_access_key\n      container_uid\n      container_main_gid\n      container_gids\n      ...TOTPActivateModalFragment\n    }\n    keypair {\n      ...GeneratedKeypairListModalFragment\n      id\n    }\n  }\n}\n\nfragment GeneratedKeypairListModalFragment on KeyPair {\n  access_key\n  secret_key\n  user_info {\n    email\n  }\n}\n\nfragment TOTPActivateModalFragment on User {\n  email\n  totp_activated @skipOnClient(if: $isNotSupportTotp)\n}\n"
  }
};
})();

(node as any).hash = "6eac042d5d8dba3d8446023d51158e3d";

export default node;
