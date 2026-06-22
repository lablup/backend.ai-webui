/**
 * @generated SignedSource<<1713ecc2a7854a248179487f04a4cffe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type BulkCreateUserV2Input = {
  users: ReadonlyArray<CreateUserV2Input>;
};
export type CreateUserV2Input = {
  allowedClientIp?: ReadonlyArray<string> | null | undefined;
  containerGids?: ReadonlyArray<number> | null | undefined;
  containerMainGid?: number | null | undefined;
  containerUid?: number | null | undefined;
  description?: string | null | undefined;
  domainName: string;
  email: string;
  fullName?: string | null | undefined;
  groupIds?: ReadonlyArray<string> | null | undefined;
  needPasswordChange: boolean;
  password: string;
  resourcePolicy?: string;
  role: UserRoleV2;
  status: UserStatusV2;
  sudoSessionEnabled?: boolean;
  totpActivated?: boolean;
  username: string;
};
export type UserSettingModalBulkCreateMutation$variables = {
  input: BulkCreateUserV2Input;
};
export type UserSettingModalBulkCreateMutation$data = {
  readonly adminBulkCreateUsersWithKeypairV2: {
    readonly created: ReadonlyArray<{
      readonly keypair: {
        readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
      };
    }>;
    readonly failed: ReadonlyArray<{
      readonly email: string;
      readonly index: number;
      readonly message: string;
      readonly username: string;
    }>;
  } | null | undefined;
};
export type UserSettingModalBulkCreateMutation = {
  response: UserSettingModalBulkCreateMutation$data;
  variables: UserSettingModalBulkCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
  "concreteType": "BulkCreateUserV2Error",
  "kind": "LinkedField",
  "name": "failed",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "index",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    },
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "message",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSettingModalBulkCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "BulkCreateUsersWithKeypairV2Payload",
        "kind": "LinkedField",
        "name": "adminBulkCreateUsersWithKeypairV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "CreateUserV2Payload",
            "kind": "LinkedField",
            "name": "created",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "CreateKeypairPayload",
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
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserSettingModalBulkCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "BulkCreateUsersWithKeypairV2Payload",
        "kind": "LinkedField",
        "name": "adminBulkCreateUsersWithKeypairV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "CreateUserV2Payload",
            "kind": "LinkedField",
            "name": "created",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "CreateKeypairPayload",
                "kind": "LinkedField",
                "name": "keypair",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "secretKey",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "KeyPairV2",
                    "kind": "LinkedField",
                    "name": "keypair",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "accessKey",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "UserV2",
                        "kind": "LinkedField",
                        "name": "user",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserV2BasicInfo",
                            "kind": "LinkedField",
                            "name": "basicInfo",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6fe7f1138e8de2327840821460478dd7",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalBulkCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserSettingModalBulkCreateMutation(\n  $input: BulkCreateUserV2Input!\n) {\n  adminBulkCreateUsersWithKeypairV2(input: $input) {\n    created {\n      keypair {\n        ...GeneratedKeypairListModalFragment\n      }\n    }\n    failed {\n      index\n      username\n      email\n      message\n    }\n  }\n}\n\nfragment GeneratedKeypairListModalFragment on CreateKeypairPayload {\n  secretKey\n  keypair {\n    accessKey\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b25dc05936010fe9134048d8253e1a75";

export default node;
