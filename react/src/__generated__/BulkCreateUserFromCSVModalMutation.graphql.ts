/**
 * @generated SignedSource<<2aebccab6b615aa38f139d2b00bc8a32>>
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
export type BulkCreateUserFromCSVModalMutation$variables = {
  input: BulkCreateUserV2Input;
};
export type BulkCreateUserFromCSVModalMutation$data = {
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
export type BulkCreateUserFromCSVModalMutation = {
  response: BulkCreateUserFromCSVModalMutation$data;
  variables: BulkCreateUserFromCSVModalMutation$variables;
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
    "name": "BulkCreateUserFromCSVModalMutation",
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
    "name": "BulkCreateUserFromCSVModalMutation",
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
    "cacheID": "091685e9dbe94293fd317366a6ddcda6",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalMutation",
    "operationKind": "mutation",
    "text": "mutation BulkCreateUserFromCSVModalMutation(\n  $input: BulkCreateUserV2Input!\n) {\n  adminBulkCreateUsersWithKeypairV2(input: $input) {\n    created {\n      keypair {\n        ...GeneratedKeypairListModalFragment\n      }\n    }\n    failed {\n      index\n      username\n      email\n      message\n    }\n  }\n}\n\nfragment GeneratedKeypairListModalFragment on CreateKeypairPayload {\n  secretKey\n  keypair {\n    accessKey\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "13be706f0ea229fc44c11c63b0230cb1";

export default node;
