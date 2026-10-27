/**
 * @generated SignedSource<<d9e3063bb5651b670fab3c9013c4f3dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectUsageBucketFilter = {
  AND?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  NOT?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  OR?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  periodEnd?: DateFilter | null | undefined;
  periodStart?: DateFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type DateFilter = {
  after?: any | null | undefined;
  before?: any | null | undefined;
  equals?: any | null | undefined;
  notEquals?: any | null | undefined;
};
export type TopProjectsUsagePanelQuery$variables = {
  filter: ProjectUsageBucketFilter;
  limit: number;
};
export type TopProjectsUsagePanelQuery$data = {
  readonly buckets: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metadata: {
          readonly periodStart: any;
        };
        readonly project: {
          readonly basicInfo: {
            readonly name: string;
          };
        } | null | undefined;
        readonly resourceGroupName: string;
        readonly resourceUsage: {
          readonly entries: ReadonlyArray<{
            readonly quantity: any;
            readonly resourceType: string;
          }>;
        };
      };
    }>;
  } | null | undefined;
};
export type TopProjectsUsagePanelQuery = {
  response: TopProjectsUsagePanelQuery$data;
  variables: TopProjectsUsagePanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "PERIOD_START"
      }
    ]
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
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
  "name": "resourceGroupName",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "UsageBucketMetadata",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "periodStart",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceSlot",
  "kind": "LinkedField",
  "name": "resourceUsage",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceSlotEntry",
      "kind": "LinkedField",
      "name": "entries",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "quantity",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TopProjectsUsagePanelQuery",
    "selections": [
      {
        "alias": "buckets",
        "args": (v1/*: any*/),
        "concreteType": "ProjectUsageBucketConnection",
        "kind": "LinkedField",
        "name": "adminProjectUsageBuckets",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectUsageBucketEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectUsageBucket",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TopProjectsUsagePanelQuery",
    "selections": [
      {
        "alias": "buckets",
        "args": (v1/*: any*/),
        "concreteType": "ProjectUsageBucketConnection",
        "kind": "LinkedField",
        "name": "adminProjectUsageBuckets",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectUsageBucketEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectUsageBucket",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v3/*: any*/)
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d3088e0aa51544687b957e9e7ef0ba09",
    "id": null,
    "metadata": {},
    "name": "TopProjectsUsagePanelQuery",
    "operationKind": "query",
    "text": "query TopProjectsUsagePanelQuery(\n  $filter: ProjectUsageBucketFilter!\n  $limit: Int!\n) {\n  buckets: adminProjectUsageBuckets(filter: $filter, orderBy: [{field: PERIOD_START, direction: DESC}], limit: $limit) {\n    count\n    edges {\n      node {\n        id\n        resourceGroupName\n        metadata {\n          periodStart\n        }\n        resourceUsage {\n          entries {\n            resourceType\n            quantity\n          }\n        }\n        project {\n          basicInfo {\n            name\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "05e90f97b0109613bedad4ac48fcf01c";

export default node;
