/**
 * @generated SignedSource<<93ad1a06d7205e10a9e82cf578a8bb4e>>
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
export type UserSettingModalCreateMutation$variables = {
  input: CreateUserV2Input;
};
export type UserSettingModalCreateMutation$data = {
  readonly adminCreateUserV2: {
    readonly keypair: {
      readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
    };
    readonly user: {
      readonly basicInfo: {
        readonly description: string | null | undefined;
        readonly email: string;
        readonly fullName: string | null | undefined;
        readonly integrationName: string | null | undefined;
        readonly username: string | null | undefined;
      };
      readonly container: {
        readonly containerGids: ReadonlyArray<number> | null | undefined;
        readonly containerMainGid: number | null | undefined;
        readonly containerUid: number | null | undefined;
      };
      readonly id: string;
      readonly organization: {
        readonly domainName: string | null | undefined;
        readonly mainAccessKey: string | null | undefined;
        readonly resourcePolicy: string;
        readonly role: UserRoleV2 | null | undefined;
      };
      readonly security: {
        readonly allowedClientIp: ReadonlyArray<string> | null | undefined;
        readonly sudoSessionEnabled: boolean;
        readonly totpActivated: boolean | null | undefined;
        readonly totpActivatedAt: string | null | undefined;
      };
      readonly status: {
        readonly needPasswordChange: boolean | null | undefined;
        readonly status: UserStatusV2;
        readonly statusInfo: string | null | undefined;
      };
      readonly timestamps: {
        readonly createdAt: string | null | undefined;
        readonly modifiedAt: string | null | undefined;
      };
    };
  } | null | undefined;
};
export type UserSettingModalCreateMutation = {
  response: UserSettingModalCreateMutation$data;
  variables: UserSettingModalCreateMutation$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2BasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
      "plural": false,
      "selections": [
        (v3/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fullName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "integrationName",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2OrganizationInfo",
      "kind": "LinkedField",
      "name": "organization",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "domainName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourcePolicy",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "mainAccessKey",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2SecurityInfo",
      "kind": "LinkedField",
      "name": "security",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totpActivated",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totpActivatedAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "sudoSessionEnabled",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "allowedClientIp",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2StatusInfo",
      "kind": "LinkedField",
      "name": "status",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "statusInfo",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "needPasswordChange",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2ContainerSettings",
      "kind": "LinkedField",
      "name": "container",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "containerUid",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "containerMainGid",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "containerGids",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EntityTimestamps",
      "kind": "LinkedField",
      "name": "timestamps",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "createdAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "modifiedAt",
          "storageKey": null
        }
      ],
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
    "name": "UserSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateUserV2Payload",
        "kind": "LinkedField",
        "name": "adminCreateUserV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateUserV2Payload",
        "kind": "LinkedField",
        "name": "adminCreateUserV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2d7a4992d94f27fba991f1f60749f2eb",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserSettingModalCreateMutation(\n  $input: CreateUserV2Input!\n) {\n  adminCreateUserV2(input: $input) {\n    user {\n      id\n      basicInfo {\n        email\n        fullName\n        username\n        description\n        integrationName\n      }\n      organization {\n        domainName\n        role\n        resourcePolicy\n        mainAccessKey\n      }\n      security {\n        totpActivated\n        totpActivatedAt\n        sudoSessionEnabled\n        allowedClientIp\n      }\n      status {\n        status\n        statusInfo\n        needPasswordChange\n      }\n      container {\n        containerUid\n        containerMainGid\n        containerGids\n      }\n      timestamps {\n        createdAt\n        modifiedAt\n      }\n    }\n    keypair {\n      ...GeneratedKeypairListModalFragment\n    }\n  }\n}\n\nfragment GeneratedKeypairListModalFragment on CreateKeypairPayload {\n  secretKey\n  keypair {\n    accessKey\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c2423094ad9f6d036021cf8a59a16f4";

export default node;
