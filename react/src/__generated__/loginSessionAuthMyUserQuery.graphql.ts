/**
 * @generated SignedSource<<1449fe5f795b939002251c8975fb1473>>
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
  needsAccessKey: boolean;
  recentProjectName: string;
};
export type loginSessionAuthMyUserQuery$data = {
  readonly myAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }> | null | undefined;
  readonly myKeypairs?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly id: string;
      };
    }>;
  } | null | undefined;
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
          readonly entityId: string;
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
    readonly entityId: string;
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
          readonly entityId: string;
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
  "name": "needsAccessKey"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "recentProjectName"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v5 = {
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
v6 = {
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
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "DomainBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "equals": "GENERAL"
},
v10 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v11 = [
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
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v12 = {
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
              "value": (v9/*: any*/)
            }
          ],
          "kind": "ObjectValue",
          "name": "filter"
        },
        (v10/*: any*/)
      ],
      "concreteType": "ProjectV2Connection",
      "kind": "LinkedField",
      "name": "projects",
      "plural": false,
      "selections": (v11/*: any*/),
      "storageKey": null
    }
  ]
},
v13 = {
  "alias": "defaultProject",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true,
        "type": (v9/*: any*/)
      }
    },
    (v10/*: any*/),
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
  "selections": (v11/*: any*/),
  "storageKey": "projects(filter:{\"isActive\":true,\"type\":{\"equals\":\"GENERAL\"}},limit:1,orderBy:[{\"direction\":\"ASC\",\"field\":\"NAME\"}])"
},
v14 = {
  "condition": "needsAccessKey",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
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
        (v10/*: any*/)
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
                (v3/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "accessKey",
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
    }
  ]
},
v15 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "configNames",
      "value": [
        "domainConfig"
      ]
    }
  ],
  "concreteType": "AppConfig",
  "kind": "LinkedField",
  "name": "myAppConfigs",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "configName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "config",
      "storageKey": null
    }
  ],
  "storageKey": "myAppConfigs(configNames:[\"domainConfig\"])"
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
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "storageKey": null
      },
      (v14/*: any*/),
      {
        "kind": "CatchField",
        "field": (v15/*: any*/),
        "to": "NULL"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
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
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v8/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "storageKey": null
      },
      (v14/*: any*/),
      (v15/*: any*/)
    ]
  },
  "params": {
    "cacheID": "04f3ad9178f19fccbd456339c590fc18",
    "id": null,
    "metadata": {},
    "name": "loginSessionAuthMyUserQuery",
    "operationKind": "query",
    "text": "query loginSessionAuthMyUserQuery(\n  $recentProjectName: String!\n  $hasRecentProject: Boolean!\n  $needsAccessKey: Boolean!\n) {\n  myUserV2 {\n    id\n    entityId\n    basicInfo {\n      email\n      fullName\n    }\n    organization {\n      domainName\n      role\n    }\n    domain {\n      entityId\n      basicInfo {\n        name\n      }\n      id\n    }\n    recentProject: projects(filter: {isActive: true, type: {equals: GENERAL}, name: {equals: $recentProjectName}}, limit: 1) @include(if: $hasRecentProject) {\n      edges {\n        node {\n          id\n          entityId\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    defaultProject: projects(filter: {isActive: true, type: {equals: GENERAL}}, orderBy: [{field: NAME, direction: ASC}], limit: 1) {\n      edges {\n        node {\n          id\n          entityId\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n  }\n  myKeypairs(filter: {isDefault: true}, limit: 1) @include(if: $needsAccessKey) {\n    edges {\n      node {\n        id\n        accessKey\n      }\n    }\n  }\n  myAppConfigs(configNames: [\"domainConfig\"]) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "0e05a1a48023d853991cc948f18ecbf3";

export default node;
