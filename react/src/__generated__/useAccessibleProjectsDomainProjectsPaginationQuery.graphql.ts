/**
 * @generated SignedSource<<67e17608b8d0406e5946b4f9f60536be>>
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
export type useAccessibleProjectsDomainProjectsPaginationQuery$variables = {
  after?: string | null | undefined;
  domainName: string;
  first?: number | null | undefined;
  scope: ProjectScope;
  types: ReadonlyArray<ProjectTypeV2>;
};
export type useAccessibleProjectsDomainProjectsPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"useAccessibleProjects_domainProjectsFragment">;
};
export type useAccessibleProjectsDomainProjectsPaginationQuery = {
  response: useAccessibleProjectsDomainProjectsPaginationQuery$data;
  variables: useAccessibleProjectsDomainProjectsPaginationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  },
  {
    "defaultValue": 1000,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "types"
  }
],
v1 = {
  "kind": "Variable",
  "name": "after",
  "variableName": "after"
},
v2 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v3 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v4 = [
  (v1/*: any*/),
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
      {
        "kind": "Literal",
        "name": "isActive",
        "value": true
      },
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
  (v2/*: any*/),
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useAccessibleProjectsDomainProjectsPaginationQuery",
    "selections": [
      {
        "args": [
          (v1/*: any*/),
          {
            "kind": "Variable",
            "name": "domainName",
            "variableName": "domainName"
          },
          (v2/*: any*/),
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
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAccessibleProjectsDomainProjectsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
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
                  },
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
        "args": (v4/*: any*/),
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
  "params": {
    "cacheID": "aa082c9a539e6ba86d36c035c2f34af8",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsDomainProjectsPaginationQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsDomainProjectsPaginationQuery(\n  $after: String\n  $domainName: String!\n  $first: Int = 1000\n  $scope: ProjectScope!\n  $types: [ProjectTypeV2!]!\n) {\n  ...useAccessibleProjects_domainProjectsFragment_mzAMF\n}\n\nfragment useAccessibleProjects_domainProjectsFragment_mzAMF on Query {\n  scopedProjectsV2(scope: $scope, filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "29519a58836b585ceb9fac59ee7d6a7e";

export default node;
