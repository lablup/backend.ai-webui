/**
 * @generated SignedSource<<12e260c3a046d68cb213724cf944cd0c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserSettingModalQuery$variables = {
  email?: string | null | undefined;
  isNotSupportTotp: boolean;
};
export type UserSettingModalQuery$data = {
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
};
export type UserSettingModalQuery = {
  response: UserSettingModalQuery$data;
  variables: UserSettingModalQuery$variables;
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
    "name": "isNotSupportTotp"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "need_password_change",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "full_name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domain_name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v10/*: any*/),
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sudo_session_enabled",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totp_activated",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "allowed_client_ip",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "main_access_key",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_uid",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_main_gid",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_gids",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSettingModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "TOTPActivateModalFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserSettingModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/),
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ce891f6376e333692778e57d40812a10",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalQuery",
    "operationKind": "query",
    "text": "query UserSettingModalQuery(\n  $email: String\n  $isNotSupportTotp: Boolean!\n) {\n  user(email: $email) {\n    email\n    username\n    need_password_change\n    full_name\n    description\n    status\n    domain_name\n    role\n    groups {\n      id\n      name\n    }\n    resource_policy\n    sudo_session_enabled\n    totp_activated @skipOnClient(if: $isNotSupportTotp)\n    allowed_client_ip\n    main_access_key\n    container_uid\n    container_main_gid\n    container_gids\n    ...TOTPActivateModalFragment\n    id\n  }\n}\n\nfragment TOTPActivateModalFragment on User {\n  email\n  totp_activated @skipOnClient(if: $isNotSupportTotp)\n}\n"
  }
};
})();

(node as any).hash = "fcd314cd2f431ffb74017e8c3b0d71bc";

export default node;
