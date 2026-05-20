/**
 * @generated SignedSource<<9e61cd99ef67f158ac2dfd9bc82bdc5b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserDropdownMenuQuery$variables = {
  email: string;
  isNotSupportTotp: boolean;
  isNotSupportUpdateUserV2: boolean;
};
export type UserDropdownMenuQuery$data = {
  readonly myClientIp: {
    readonly clientIp: string;
  } | null | undefined;
  readonly user: {
    readonly full_name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"UserProfileSettingModalFragment">;
  } | null | undefined;
};
export type UserDropdownMenuQuery = {
  response: UserDropdownMenuQuery$data;
  variables: UserDropdownMenuQuery$variables;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportUpdateUserV2"
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
  "name": "full_name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "MyClientIp",
  "kind": "LinkedField",
  "name": "myClientIp",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clientIp",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserDropdownMenuQuery",
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
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserProfileSettingModalFragment"
          }
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserDropdownMenuQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totp_activated",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "allowed_client_ip",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ]
  },
  "params": {
    "cacheID": "c86352116550399193b8fd578bf1ef51",
    "id": null,
    "metadata": {},
    "name": "UserDropdownMenuQuery",
    "operationKind": "query",
    "text": "query UserDropdownMenuQuery(\n  $email: String!\n  $isNotSupportTotp: Boolean!\n  $isNotSupportUpdateUserV2: Boolean!\n) {\n  user(email: $email) {\n    full_name\n    ...UserProfileSettingModalFragment\n    id\n  }\n  myClientIp @skipOnClient(if: $isNotSupportUpdateUserV2) {\n    clientIp\n  }\n}\n\nfragment TOTPActivateModalFragment on User {\n  email\n  totp_activated @skipOnClient(if: $isNotSupportTotp)\n}\n\nfragment UserProfileSettingModalFragment on User {\n  id\n  full_name\n  totp_activated @skipOnClient(if: $isNotSupportTotp)\n  allowed_client_ip @skipOnClient(if: $isNotSupportUpdateUserV2)\n  ...TOTPActivateModalFragment\n}\n"
  }
};
})();

(node as any).hash = "2a298febd430ea45ea0f3f88c0758d8b";

export default node;
