/**
 * @generated SignedSource<<314a68f8fc57fbe562f48c72639f2d5e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type useAccessibleProjectsQuery$variables = {
  domainName: string;
  isAdmin: boolean;
  types: ReadonlyArray<ProjectTypeV2>;
};
export type useAccessibleProjectsQuery$data = {
  readonly adminDomainProjects?: {
    readonly " $fragmentSpreads": FragmentRefs<"useAccessibleProjects_domainProjectsFragment">;
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
  "kind": "Variable",
  "name": "domainName",
  "variableName": "domainName"
},
v4 = {
  "kind": "Literal",
  "name": "isActive",
  "value": true
},
v5 = {
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
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
v8 = {
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
v9 = {
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
},
v10 = {
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
        (v4/*: any*/),
        (v5/*: any*/)
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 1000
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
            (v6/*: any*/),
            (v7/*: any*/),
            (v8/*: any*/),
            (v9/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v11 = [
  {
    "fields": [
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 1000
  },
  {
    "fields": [
      (v3/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
];
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
      {
        "condition": "isAdmin",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": [
                    (v3/*: any*/),
                    {
                      "kind": "Variable",
                      "name": "types",
                      "variableName": "types"
                    }
                  ],
                  "kind": "FragmentSpread",
                  "name": "useAccessibleProjects_domainProjectsFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "adminDomainProjects"
          }
        ]
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v10/*: any*/)
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
      {
        "condition": "isAdmin",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v11/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "domainProjectsV2",
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
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
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
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
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
            "args": (v11/*: any*/),
            "filters": [
              "scope",
              "filter"
            ],
            "handle": "connection",
            "key": "useAccessibleProjects_domainProjectsV2",
            "kind": "LinkedHandle",
            "name": "domainProjectsV2"
          }
        ]
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1cacc5ff0d041553370f6feaf981d7a2",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsQuery(\n  $domainName: String!\n  $types: [ProjectTypeV2!]!\n  $isAdmin: Boolean!\n) {\n  ...useAccessibleProjects_domainProjectsFragment_3xDdiz @include(if: $isAdmin)\n  myUserV2 {\n    projects(filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, limit: 1000) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n            type\n          }\n          organization {\n            resourcePolicy\n          }\n          lifecycle {\n            isActive\n          }\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment useAccessibleProjects_domainProjectsFragment_3xDdiz on Query {\n  domainProjectsV2(scope: {domainName: $domainName}, filter: {isActive: true, type: {in_: $types}}, first: 1000) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1b7160bdb69a32afe7bb8e708b4aa7e";

export default node;
