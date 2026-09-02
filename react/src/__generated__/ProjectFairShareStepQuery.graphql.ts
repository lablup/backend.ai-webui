/**
 * @generated SignedSource<<c17e0dcbf5998f79378510bbc4eaf131>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ProjectFairShareOrderField = "CREATED_AT" | "FAIR_SHARE_FACTOR" | "PROJECT_IS_ACTIVE" | "PROJECT_NAME" | "%future added value";
export type ProjectFairShareTypeEnum = "GENERAL" | "MODEL_STORE" | "%future added value";
export type RGProjectFairShareFilter = {
  AND?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  NOT?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  OR?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  project?: ProjectFairShareProjectNestedFilter | null | undefined;
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
export type ProjectFairShareProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
  type?: ProjectFairShareTypeEnumFilter | null | undefined;
};
export type ProjectFairShareTypeEnumFilter = {
  equals?: ProjectFairShareTypeEnum | null | undefined;
  in?: ReadonlyArray<ProjectFairShareTypeEnum> | null | undefined;
  notEquals?: ProjectFairShareTypeEnum | null | undefined;
  notIn?: ReadonlyArray<ProjectFairShareTypeEnum> | null | undefined;
};
export type ProjectFairShareOrderBy = {
  direction?: OrderDirection;
  field: ProjectFairShareOrderField;
};
export type ProjectFairShareStepQuery$variables = {
  domainName: string;
  filter?: RGProjectFairShareFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  order?: ReadonlyArray<ProjectFairShareOrderBy> | null | undefined;
  resourceGroupName: string;
};
export type ProjectFairShareStepQuery$data = {
  readonly projectFairShares: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ProjectFairShareTableFragment">;
      };
    }>;
  };
  readonly resourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ResourceGroupFragment" | "ResourceGroupSchedulerTypeAlertFragment">;
      };
    }>;
  } | null | undefined;
};
export type ProjectFairShareStepQuery = {
  response: ProjectFairShareStepQuery$data;
  variables: ProjectFairShareStepQuery$variables;
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
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v6 = [
  {
    "fields": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "equals",
            "variableName": "resourceGroupName"
          }
        ],
        "kind": "ObjectValue",
        "name": "name"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v7 = [
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
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "order"
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      },
      {
        "kind": "Variable",
        "name": "resourceGroupName",
        "variableName": "resourceGroupName"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = [
  (v9/*: any*/)
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
    "name": "ProjectFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v6/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ResourceGroupSchedulerTypeAlertFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "FairShareWeightSettingModal_ResourceGroupFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "kind": "RequiredField",
        "field": {
          "alias": "projectFairShares",
          "args": (v7/*: any*/),
          "concreteType": "ProjectFairShareConnection",
          "kind": "LinkedField",
          "name": "rgProjectFairShares",
          "plural": false,
          "selections": [
            (v8/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectFairShareEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ProjectFairShare",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ProjectFairShareTableFragment"
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        "action": "THROW"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v5/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v6/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceGroupSchedulerConfig",
                    "kind": "LinkedField",
                    "name": "scheduler",
                    "plural": false,
                    "selections": [
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
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": "projectFairShares",
        "args": (v7/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectFairShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectFairShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectBasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": (v11/*: any*/),
                        "storageKey": null
                      },
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "resourceGroupName",
                    "storageKey": null
                  },
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
                    "name": "projectId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FairShareSpec",
                    "kind": "LinkedField",
                    "name": "spec",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "weight",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "usesDefault",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FairShareCalculationSnapshot",
                    "kind": "LinkedField",
                    "name": "calculationSnapshot",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "fairShareFactor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "averageDailyDecayedUsage",
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
                      }
                    ],
                    "storageKey": null
                  },
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
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceGroup",
                    "kind": "LinkedField",
                    "name": "resourceGroup",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DomainV2",
                    "kind": "LinkedField",
                    "name": "domain",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DomainBasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": (v11/*: any*/),
                        "storageKey": null
                      },
                      (v10/*: any*/)
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
    "cacheID": "854a6b5155b4e5d3a32f635f59768056",
    "id": null,
    "metadata": {},
    "name": "ProjectFairShareStepQuery",
    "operationKind": "query",
    "text": "query ProjectFairShareStepQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n  $filter: RGProjectFairShareFilter\n  $order: [ProjectFairShareOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  resourceGroups: adminResourceGroups(filter: {name: {equals: $resourceGroupName}}, limit: 1) {\n    edges {\n      node {\n        ...ResourceGroupSchedulerTypeAlertFragment\n        ...FairShareWeightSettingModal_ResourceGroupFragment\n        id\n      }\n    }\n  }\n  projectFairShares: rgProjectFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName}, filter: $filter, orderBy: $order, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...ProjectFairShareTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment FairShareWeightSettingModal_ProjectFragment on ProjectFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  projectId\n  spec {\n    weight\n  }\n  ...ProjectResourceGroupAlertFragment\n}\n\nfragment FairShareWeightSettingModal_ResourceGroupFragment on ResourceGroup {\n  scheduler {\n    type\n  }\n  name\n}\n\nfragment ProjectFairShareTableFragment on ProjectFairShare {\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  projectId\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...ProjectResourceGroupWarningIconFragment\n  ...FairShareWeightSettingModal_ProjectFragment\n  ...UsageBucketModal_ProjectFragment\n}\n\nfragment ProjectResourceGroupAlertFragment on ProjectFairShare {\n  projectId\n  domainName\n  resourceGroupName\n}\n\nfragment ProjectResourceGroupWarningIconFragment on ProjectFairShare {\n  projectId\n  domainName\n  resourceGroupName\n}\n\nfragment ResourceGroupSchedulerTypeAlertFragment on ResourceGroup {\n  name\n  scheduler {\n    type\n  }\n}\n\nfragment UsageBucketChartContent_ProjectFragment on ProjectFairShare {\n  id\n  domainName\n  projectId\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketModal_ProjectFragment on ProjectFairShare {\n  id\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  ...UsageBucketChartContent_ProjectFragment\n}\n"
  }
};
})();

(node as any).hash = "dfdc5241b1220afbd5387275a657b4ed";

export default node;
