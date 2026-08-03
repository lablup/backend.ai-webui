/**
 * @generated SignedSource<<a30cc95455bcbea9689ae09adfdd5407>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainFairShareOrderField = "CREATED_AT" | "DOMAIN_IS_ACTIVE" | "DOMAIN_NAME" | "FAIR_SHARE_FACTOR" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RGDomainFairShareFilter = {
  AND?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  NOT?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  OR?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  domain?: DomainFairShareDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
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
export type DomainFairShareDomainNestedFilter = {
  isActive?: boolean | null | undefined;
};
export type DomainFairShareOrderBy = {
  direction?: OrderDirection;
  field: DomainFairShareOrderField;
};
export type DomainFairShareStepQuery$variables = {
  filter?: RGDomainFairShareFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  order?: ReadonlyArray<DomainFairShareOrderBy> | null | undefined;
  resourceGroupName: string;
};
export type DomainFairShareStepQuery$data = {
  readonly domainFairShares: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"DomainFairShareTableFragment">;
      };
    }>;
  };
  readonly resourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ResourceGroupFragment">;
      };
    }>;
  } | null | undefined;
};
export type DomainFairShareStepQuery = {
  response: DomainFairShareStepQuery$data;
  variables: DomainFairShareStepQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v5 = [
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
v6 = [
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
        "name": "resourceGroupName",
        "variableName": "resourceGroupName"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DomainFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v5/*: any*/),
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
          "alias": "domainFairShares",
          "args": (v6/*: any*/),
          "concreteType": "DomainFairShareConnection",
          "kind": "LinkedField",
          "name": "rgDomainFairShares",
          "plural": false,
          "selections": [
            (v7/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "DomainFairShareEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "DomainFairShare",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "DomainFairShareTableFragment"
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
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "DomainFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v5/*: any*/),
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
      {
        "alias": "domainFairShares",
        "args": (v6/*: any*/),
        "concreteType": "DomainFairShareConnection",
        "kind": "LinkedField",
        "name": "rgDomainFairShares",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainFairShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DomainFairShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
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
                        "selections": [
                          (v8/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/),
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
                        "kind": "ScalarField",
                        "name": "normalizedUsage",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "42e1249c8f11463e261bcece2a6b3373",
    "id": null,
    "metadata": {},
    "name": "DomainFairShareStepQuery",
    "operationKind": "query",
    "text": "query DomainFairShareStepQuery(\n  $resourceGroupName: String!\n  $filter: RGDomainFairShareFilter\n  $order: [DomainFairShareOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  resourceGroups: adminResourceGroups(filter: {name: {equals: $resourceGroupName}}, limit: 1) {\n    edges {\n      node {\n        ...FairShareWeightSettingModal_ResourceGroupFragment\n        id\n      }\n    }\n  }\n  domainFairShares: rgDomainFairShares(scope: {resourceGroupName: $resourceGroupName}, filter: $filter, orderBy: $order, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...DomainFairShareTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment DomainFairShareTableFragment on DomainFairShare {\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    normalizedUsage\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...DomainResourceGroupWarningIconFragment\n  ...FairShareWeightSettingModal_DomainFragment\n  ...UsageBucketModal_DomainFragment\n}\n\nfragment DomainResourceGroupAlertFragment on DomainFairShare {\n  domainName\n  resourceGroupName\n}\n\nfragment DomainResourceGroupWarningIconFragment on DomainFairShare {\n  domainName\n  resourceGroupName\n}\n\nfragment FairShareWeightSettingModal_DomainFragment on DomainFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  spec {\n    weight\n  }\n  ...DomainResourceGroupAlertFragment\n}\n\nfragment FairShareWeightSettingModal_ResourceGroupFragment on ResourceGroup {\n  scheduler {\n    type\n  }\n  name\n}\n\nfragment UsageBucketChartContent_DomainFragment on DomainFairShare {\n  id\n  domainName\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketModal_DomainFragment on DomainFairShare {\n  id\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  resourceGroup {\n    name\n    id\n  }\n  ...UsageBucketChartContent_DomainFragment\n}\n"
  }
};
})();

(node as any).hash = "36e09c0b0a8757c152dd77fc2f8f9290";

export default node;
