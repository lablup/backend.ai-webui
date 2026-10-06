/**
 * @generated SignedSource<<dd82ea98f2737cad952045ab250a7c57>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type loginSessionAuthMyUserQuery$variables = {
  hasRecentProject: boolean;
  recentProjectName: string;
};
export type loginSessionAuthMyUserQuery$data = {
  readonly myUserV2: {
    readonly basicInfo: {
      readonly email: string;
      readonly fullName: string | null | undefined;
    };
    readonly defaultProject: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly id: string;
        };
      }>;
    } | null | undefined;
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
    readonly recentProject?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly id: string;
        };
      }>;
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
  "name": "hasRecentProject"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "recentProjectName"
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
  "equals": "GENERAL"
},
v9 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v10 = [
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
  }
],
v11 = {
  "condition": "hasRecentProject",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "recentProject",
      "args": [
        {
          "fields": [
            {
              "kind": "Literal",
              "name": "isActive",
              "value": true
            },
            {
              "fields": [
                {
                  "kind": "Variable",
                  "name": "equals",
                  "variableName": "recentProjectName"
                }
              ],
              "kind": "ObjectValue",
              "name": "name"
            },
            {
              "kind": "Literal",
              "name": "type",
              "value": (v8/*: any*/)
            }
          ],
          "kind": "ObjectValue",
          "name": "filter"
        },
        (v9/*: any*/)
      ],
      "concreteType": "ProjectV2Connection",
      "kind": "LinkedField",
      "name": "projects",
      "plural": false,
      "selections": (v10/*: any*/),
      "storageKey": null
    }
  ]
},
v12 = {
  "alias": "defaultProject",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true,
        "type": (v8/*: any*/)
      }
    },
    (v9/*: any*/),
    {
      "kind": "Literal",
      "name": "orderBy",
      "value": [
        {
          "direction": "ASC",
          "field": "NAME"
        }
      ]
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": "projects(filter:{\"isActive\":true,\"type\":{\"equals\":\"GENERAL\"}},limit:1,orderBy:[{\"direction\":\"ASC\",\"field\":\"NAME\"}])"
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
          (v11/*: any*/),
          (v12/*: any*/)
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
          (v11/*: any*/),
          (v12/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b5bf366d0d2179c0a7d1238e63d0196b",
    "id": null,
    "metadata": {},
    "name": "loginSessionAuthMyUserQuery",
    "operationKind": "query",
    "text": "query loginSessionAuthMyUserQuery(\n  $recentProjectName: String!\n  $hasRecentProject: Boolean!\n) {\n  myUserV2 {\n    id\n    basicInfo {\n      email\n      fullName\n    }\n    organization {\n      domainName\n      role\n    }\n    domain {\n      entityId\n      basicInfo {\n        name\n      }\n      id\n    }\n    recentProject: projects(filter: {isActive: true, type: {equals: GENERAL}, name: {equals: $recentProjectName}}, limit: 1) @include(if: $hasRecentProject) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    defaultProject: projects(filter: {isActive: true, type: {equals: GENERAL}}, orderBy: [{field: NAME, direction: ASC}], limit: 1) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f045c010e1773e462189296d4fe9594";

export default node;
