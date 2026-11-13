/**
 * @generated SignedSource<<6b15ab0168d8ea4fd02fca887a88c920>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type loginBootstrapQuery$variables = Record<PropertyKey, never>;
export type loginBootstrapQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly description: string | null | undefined;
    readonly id: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly myKeypairs: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly id: string;
        readonly resourcePolicy: string;
        readonly userId: string;
      };
    }>;
  } | null | undefined;
  readonly myUserV2: {
    readonly basicInfo: {
      readonly email: string;
      readonly fullName: string | null | undefined;
      readonly username: string | null | undefined;
    };
    readonly entityId: string;
    readonly id: string;
    readonly organization: {
      readonly domainName: string | null | undefined;
      readonly role: UserRoleV2 | null | undefined;
    };
    readonly status: {
      readonly needPasswordChange: boolean | null | undefined;
      readonly status: UserStatusV2;
    };
  } | null | undefined;
};
export type loginBootstrapQuery = {
  response: loginBootstrapQuery$data;
  variables: loginBootstrapQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "isDefault": true
        }
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      }
    ],
    "concreteType": "KeyPairConnection",
    "kind": "LinkedField",
    "name": "myKeypairs",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairV2",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v0/*: any*/),
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
                "kind": "ScalarField",
                "name": "userId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourcePolicy",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "myKeypairs(filter:{\"isDefault\":true},limit:1)"
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "UserV2",
    "kind": "LinkedField",
    "name": "myUserV2",
    "plural": false,
    "selections": [
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2BasicInfo",
        "kind": "LinkedField",
        "name": "basicInfo",
        "plural": false,
        "selections": [
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
            "name": "email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fullName",
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
            "name": "needPasswordChange",
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
            "name": "role",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "domainName",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      },
      {
        "kind": "Literal",
        "name": "type",
        "value": [
          "GENERAL"
        ]
      }
    ],
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
    "selections": [
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
        "name": "is_active",
        "storageKey": null
      }
    ],
    "storageKey": "groups(is_active:true,type:[\"GENERAL\"])"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "loginBootstrapQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "loginBootstrapQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2cb1f2f220697664361da8fdf07878b3",
    "id": null,
    "metadata": {},
    "name": "loginBootstrapQuery",
    "operationKind": "query",
    "text": "query loginBootstrapQuery {\n  myKeypairs(filter: {isDefault: true}, limit: 1) {\n    edges {\n      node {\n        id\n        accessKey\n        userId\n        resourcePolicy\n      }\n    }\n  }\n  myUserV2 {\n    id\n    entityId\n    basicInfo {\n      username\n      email\n      fullName\n    }\n    status {\n      status\n      needPasswordChange\n    }\n    organization {\n      role\n      domainName\n    }\n  }\n  groups(is_active: true, type: [\"GENERAL\"]) {\n    id\n    name\n    description\n    is_active\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5c6d6c415203923f4ebd801fe788ef4";

export default node;
