/**
 * @generated SignedSource<<97ace1f847f16980fe221d6ca38f9a38>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type loginSessionAuthMyUserQuery$variables = {
  after?: string | null | undefined;
  first: number;
};
export type loginSessionAuthMyUserQuery$data = {
  readonly myUserV2: {
    readonly basicInfo: {
      readonly email: string;
      readonly fullName: string | null | undefined;
    };
    readonly domain: {
      readonly basicInfo: {
        readonly name: string;
      };
      readonly entityId: string;
    } | null | undefined;
    readonly id: string;
    readonly organization: {
      readonly domainName: string | null | undefined;
      readonly role: UserRoleV2 | null | undefined;
    };
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly id: string;
        };
      }>;
      readonly pageInfo: {
        readonly endCursor: string | null | undefined;
        readonly hasNextPage: boolean;
      };
    } | null | undefined;
  } | null | undefined;
};
export type loginSessionAuthMyUserQuery = {
  response: loginSessionAuthMyUserQuery$data;
  variables: loginSessionAuthMyUserQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
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
  "concreteType": "UserV2BasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
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
v4 = {
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
    }
  ],
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "DomainBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "after",
      "variableName": "after"
    },
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true
      }
    },
    {
      "kind": "Variable",
      "name": "first",
      "variableName": "first"
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": (v6/*: any*/),
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
      "args": null,
      "concreteType": "PageInfo",
      "kind": "LinkedField",
      "name": "pageInfo",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hasNextPage",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "endCursor",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "loginSessionAuthMyUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              (v7/*: any*/)
            ],
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "loginSessionAuthMyUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              (v7/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0b2f02d46d670906ecdd8d39ccc133b2",
    "id": null,
    "metadata": {},
    "name": "loginSessionAuthMyUserQuery",
    "operationKind": "query",
    "text": "query loginSessionAuthMyUserQuery(\n  $first: Int!\n  $after: String\n) {\n  myUserV2 {\n    id\n    basicInfo {\n      email\n      fullName\n    }\n    organization {\n      domainName\n      role\n    }\n    domain {\n      entityId\n      basicInfo {\n        name\n      }\n      id\n    }\n    projects(filter: {isActive: true}, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3641768b2c49f995d0bd87d0f44ef8a8";

export default node;
