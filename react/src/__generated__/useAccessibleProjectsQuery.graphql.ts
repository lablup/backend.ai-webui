/**
 * @generated SignedSource<<9038d037ad349f53a41bf5b02131464c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type useAccessibleProjectsQuery$variables = {
  domainName: string;
  isAdmin: boolean;
  types: ReadonlyArray<ProjectTypeV2>;
};
export type useAccessibleProjectsQuery$data = {
  readonly domainProjectsV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
          readonly type: ProjectTypeV2;
        };
        readonly id: string;
        readonly lifecycle: {
          readonly isActive: boolean | null | undefined;
        };
        readonly organization: {
          readonly resourcePolicy: string;
        };
      };
    }>;
  } | null | undefined;
  readonly myUserV2: {
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
            readonly type: ProjectTypeV2;
          };
          readonly id: string;
          readonly lifecycle: {
            readonly isActive: boolean | null | undefined;
          };
          readonly organization: {
            readonly resourcePolicy: string;
          };
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type useAccessibleProjectsQuery = {
  response: useAccessibleProjectsQuery$data;
  variables: useAccessibleProjectsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isAdmin"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "types"
},
v3 = {
  "kind": "Literal",
  "name": "isActive",
  "value": true
},
v4 = {
  "fields": [
    {
      "kind": "Variable",
      "name": "in_",
      "variableName": "types"
    }
  ],
  "kind": "ObjectValue",
  "name": "type"
},
v5 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1000
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
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
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
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
                "name": "type",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectOrganizationInfo",
            "kind": "LinkedField",
            "name": "organization",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourcePolicy",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectLifecycleInfo",
            "kind": "LinkedField",
            "name": "lifecycle",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isActive",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v8 = {
  "condition": "isAdmin",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "fields": [
            (v3/*: any*/),
            (v4/*: any*/)
          ],
          "kind": "ObjectValue",
          "name": "filter"
        },
        (v5/*: any*/),
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "domainName",
              "variableName": "domainName"
            }
          ],
          "kind": "ObjectValue",
          "name": "scope"
        }
      ],
      "concreteType": "ProjectV2Connection",
      "kind": "LinkedField",
      "name": "domainProjectsV2",
      "plural": false,
      "selections": (v7/*: any*/),
      "storageKey": null
    }
  ]
},
v9 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "domainName"
            }
          ],
          "kind": "ObjectValue",
          "name": "domainName"
        },
        (v3/*: any*/),
        (v4/*: any*/)
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
    (v5/*: any*/)
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": (v7/*: any*/),
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
    "name": "useAccessibleProjectsQuery",
    "selections": [
      (v8/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v9/*: any*/)
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
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useAccessibleProjectsQuery",
    "selections": [
      (v8/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "62e5b468bad839f69f262418080bc709",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsQuery(\n  $domainName: String!\n  $types: [ProjectTypeV2!]!\n  $isAdmin: Boolean!\n) {\n  domainProjectsV2(scope: {domainName: $domainName}, filter: {isActive: true, type: {in_: $types}}, limit: 1000) @include(if: $isAdmin) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n      }\n    }\n  }\n  myUserV2 {\n    projects(filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, limit: 1000) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n            type\n          }\n          organization {\n            resourcePolicy\n          }\n          lifecycle {\n            isActive\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "cd9b52161cad53a629ecf02b1c94a401";

export default node;
