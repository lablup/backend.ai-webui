/**
 * @generated SignedSource<<d0a067c5ee44de99f91631a1a2182007>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type UserFairShareOrderField = "CREATED_AT" | "FAIR_SHARE_FACTOR" | "USER_EMAIL" | "USER_USERNAME" | "%future added value";
export type RGUserFairShareFilter = {
  AND?: ReadonlyArray<RGUserFairShareFilter> | null | undefined;
  NOT?: ReadonlyArray<RGUserFairShareFilter> | null | undefined;
  OR?: ReadonlyArray<RGUserFairShareFilter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
  user?: UserFairShareUserNestedFilter | null | undefined;
  userUuid?: UUIDFilter | null | undefined;
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
export type UserFairShareUserNestedFilter = {
  email?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
};
export type UserFairShareOrderBy = {
  direction?: OrderDirection;
  field: UserFairShareOrderField;
};
export type UserFairShareStepQuery$variables = {
  domainName: string;
  filter?: RGUserFairShareFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  order?: ReadonlyArray<UserFairShareOrderBy> | null | undefined;
  projectId: string;
  resourceGroupName: string;
};
export type UserFairShareStepQuery$data = {
  readonly resourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ResourceGroupFragment">;
      };
    }>;
  } | null | undefined;
  readonly userFairShares: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"UserFairShareTableFragment">;
      };
    }>;
  };
};
export type UserFairShareStepQuery = {
  response: UserFairShareStepQuery$data;
  variables: UserFairShareStepQuery$variables;
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
  "name": "projectId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v7 = [
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
v8 = [
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
        "name": "projectId",
        "variableName": "projectId"
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
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = [
  (v10/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v7/*: any*/),
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
          "alias": "userFairShares",
          "args": (v8/*: any*/),
          "concreteType": "UserFairShareConnection",
          "kind": "LinkedField",
          "name": "rgUserFairShares",
          "plural": false,
          "selections": [
            (v9/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "UserFairShareEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "UserFairShare",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "UserFairShareTableFragment"
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
      (v6/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserFairShareStepQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v7/*: any*/),
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
                  (v10/*: any*/),
                  (v11/*: any*/)
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
        "alias": "userFairShares",
        "args": (v8/*: any*/),
        "concreteType": "UserFairShareConnection",
        "kind": "LinkedField",
        "name": "rgUserFairShares",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "UserFairShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserFairShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      {
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
                            "name": "username",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "email",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v11/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v11/*: any*/),
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
                    "kind": "ScalarField",
                    "name": "userUuid",
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
                      (v10/*: any*/),
                      (v11/*: any*/)
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
                        "selections": (v12/*: any*/),
                        "storageKey": null
                      },
                      (v11/*: any*/)
                    ],
                    "storageKey": null
                  },
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
                        "selections": (v12/*: any*/),
                        "storageKey": null
                      },
                      (v11/*: any*/)
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
    "cacheID": "a2f99bebeabfc9281d7297fd6290ec07",
    "id": null,
    "metadata": {},
    "name": "UserFairShareStepQuery",
    "operationKind": "query",
    "text": "query UserFairShareStepQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n  $projectId: String!\n  $filter: RGUserFairShareFilter\n  $order: [UserFairShareOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  resourceGroups: adminResourceGroups(filter: {name: {equals: $resourceGroupName}}, limit: 1) {\n    edges {\n      node {\n        ...FairShareWeightSettingModal_ResourceGroupFragment\n        id\n      }\n    }\n  }\n  userFairShares: rgUserFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName, projectId: $projectId}, filter: $filter, orderBy: $order, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...UserFairShareTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment FairShareWeightSettingModal_ResourceGroupFragment on ResourceGroup {\n  scheduler {\n    type\n  }\n  name\n}\n\nfragment FairShareWeightSettingModal_UserFragment on UserFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  user {\n    basicInfo {\n      email\n    }\n    id\n  }\n  id\n  projectId\n  userUuid\n  spec {\n    weight\n  }\n}\n\nfragment UsageBucketChartContent_UserFragment on UserFairShare {\n  id\n  domainName\n  projectId\n  userUuid\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketModal_UserFragment on UserFairShare {\n  id\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  user {\n    basicInfo {\n      email\n    }\n    id\n  }\n  ...UsageBucketChartContent_UserFragment\n}\n\nfragment UserFairShareTableFragment on UserFairShare {\n  user {\n    basicInfo {\n      username\n      email\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  projectId\n  userUuid\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...FairShareWeightSettingModal_UserFragment\n  ...UsageBucketModal_UserFragment\n}\n"
  }
};
})();

(node as any).hash = "ddf8cd1937580d44746a9f1e5f26a720";

export default node;
