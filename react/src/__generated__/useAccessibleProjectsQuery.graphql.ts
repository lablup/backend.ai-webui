/**
 * @generated SignedSource<<1583a3ae8078adeca55cae3d11df772f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type useAccessibleProjectsQuery$variables = {
  domainName: string;
  domainScope: ProjectScope;
  isAdmin: boolean;
  memberTypes: ReadonlyArray<ProjectTypeV2>;
  types: ReadonlyArray<ProjectTypeV2>;
  userScope: ProjectScope;
};
export type useAccessibleProjectsQuery$data = {
  readonly adminDomainProjects?: {
    readonly " $fragmentSpreads": FragmentRefs<"useAccessibleProjects_domainProjectsFragment">;
  } | null | undefined;
  readonly memberProjects: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
          readonly type: ProjectTypeV2;
        };
        readonly entityId: string;
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
  "name": "domainScope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isAdmin"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memberTypes"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "types"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userScope"
},
v6 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "domainScope"
},
v7 = {
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
v8 = {
  "kind": "Literal",
  "name": "isActive",
  "value": true
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v11 = {
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
v12 = {
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
v13 = {
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
v14 = {
  "alias": "memberProjects",
  "args": [
    {
      "fields": [
        (v7/*: any*/),
        (v8/*: any*/),
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "in_",
              "variableName": "memberTypes"
            }
          ],
          "kind": "ObjectValue",
          "name": "type"
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 1000
    },
    {
      "kind": "Variable",
      "name": "scope",
      "variableName": "userScope"
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "scopedProjectsV2",
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
            (v9/*: any*/),
            (v10/*: any*/),
            (v11/*: any*/),
            (v12/*: any*/),
            (v13/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v15 = [
  {
    "fields": [
      (v7/*: any*/),
      (v8/*: any*/),
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "in_",
            "variableName": "types"
          }
        ],
        "kind": "ObjectValue",
        "name": "type"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 1000
  },
  (v6/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
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
                    {
                      "kind": "Variable",
                      "name": "domainName",
                      "variableName": "domainName"
                    },
                    (v6/*: any*/),
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
      (v14/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
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
            "args": (v15/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "scopedProjectsV2",
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
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
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
            "args": (v15/*: any*/),
            "filters": [
              "scope",
              "filter"
            ],
            "handle": "connection",
            "key": "useAccessibleProjects_scopedProjectsV2",
            "kind": "LinkedHandle",
            "name": "scopedProjectsV2"
          }
        ]
      },
      (v14/*: any*/)
    ]
  },
  "params": {
    "cacheID": "a1493c6666354280196c2dd0d7e6af92",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsQuery(\n  $domainScope: ProjectScope!\n  $userScope: ProjectScope!\n  $domainName: String!\n  $types: [ProjectTypeV2!]!\n  $memberTypes: [ProjectTypeV2!]!\n  $isAdmin: Boolean!\n) {\n  ...useAccessibleProjects_domainProjectsFragment_3pmY80 @include(if: $isAdmin)\n  memberProjects: scopedProjectsV2(scope: $userScope, filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $memberTypes}}, limit: 1000) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n      }\n    }\n  }\n}\n\nfragment useAccessibleProjects_domainProjectsFragment_3pmY80 on Query {\n  scopedProjectsV2(scope: $domainScope, filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, first: 1000) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a8f1f3f4b58f6371b95078b8f071d2d2";

export default node;
