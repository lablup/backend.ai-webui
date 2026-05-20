/**
 * @generated SignedSource<<c47f9a30571dbb9f442fb7db4afa320b>>
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
export type ProjectFairShareOrderField = "CREATED_AT" | "FAIR_SHARE_FACTOR" | "PROJECT_IS_ACTIVE" | "PROJECT_NAME" | "%future added value";
export type ProjectFairShareTypeEnum = "GENERAL" | "MODEL_STORE" | "%future added value";
export type ResourceGroupOrderField = "CREATED_AT" | "IS_ACTIVE" | "NAME" | "%future added value";
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
export type UserFairShareOrderField = "CREATED_AT" | "FAIR_SHARE_FACTOR" | "USER_EMAIL" | "USER_USERNAME" | "%future added value";
export type ResourceGroupFilter = {
  AND?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  NOT?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  OR?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  description?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isPublic?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
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
export type ResourceGroupOrderBy = {
  direction?: OrderDirection;
  field: ResourceGroupOrderField;
};
export type RGDomainFairShareFilter = {
  AND?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  NOT?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  OR?: ReadonlyArray<RGDomainFairShareFilter> | null | undefined;
  domain?: DomainFairShareDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
};
export type DomainFairShareDomainNestedFilter = {
  isActive?: boolean | null | undefined;
};
export type DomainFairShareOrderBy = {
  direction?: OrderDirection;
  field: DomainFairShareOrderField;
};
export type RGProjectFairShareFilter = {
  AND?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  NOT?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  OR?: ReadonlyArray<RGProjectFairShareFilter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  project?: ProjectFairShareProjectNestedFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
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
export type UserFairShareUserNestedFilter = {
  email?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
};
export type UserFairShareOrderBy = {
  direction?: OrderDirection;
  field: UserFairShareOrderField;
};
export type FairShareListQuery$variables = {
  domainFilter?: RGDomainFairShareFilter | null | undefined;
  domainName: string;
  domainOrder?: ReadonlyArray<DomainFairShareOrderBy> | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  projectFilter?: RGProjectFairShareFilter | null | undefined;
  projectId: string;
  projectIdStr: string;
  projectOrder?: ReadonlyArray<ProjectFairShareOrderBy> | null | undefined;
  resourceGroupFilter?: ResourceGroupFilter | null | undefined;
  resourceGroupName: string;
  resourceGroupOrder?: ReadonlyArray<ResourceGroupOrderBy> | null | undefined;
  skipDomain: boolean;
  skipParentProject: boolean;
  skipProject: boolean;
  skipUser: boolean;
  userFilter?: RGUserFairShareFilter | null | undefined;
  userOrder?: ReadonlyArray<UserFairShareOrderBy> | null | undefined;
};
export type FairShareListQuery$data = {
  readonly domainFairShares?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"DomainFairShareTableFragment">;
      };
    }>;
  };
  readonly project?: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly projectFairShares?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ProjectFairShareTableFragment">;
      };
    }>;
  };
  readonly resourceGroups: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string;
        readonly scheduler: {
          readonly type: SchedulerType;
        };
        readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ResourceGroupFragment" | "ResourceGroupFairShareTableFragment">;
      };
    }>;
  } | null | undefined;
  readonly userFairShares?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"UserFairShareTableFragment">;
      };
    }>;
  };
};
export type FairShareListQuery = {
  response: FairShareListQuery$data;
  variables: FairShareListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainOrder"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectFilter"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectIdStr"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectOrder"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupFilter"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupOrder"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipDomain"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipParentProject"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProject"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipUser"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userFilter"
},
v17 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userOrder"
},
v18 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v19 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v20 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "resourceGroupFilter"
  },
  (v18/*: any*/),
  (v19/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "resourceGroupOrder"
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v23 = {
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
v24 = {
  "kind": "Variable",
  "name": "resourceGroupName",
  "variableName": "resourceGroupName"
},
v25 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "domainFilter"
  },
  (v18/*: any*/),
  (v19/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "domainOrder"
  },
  {
    "fields": [
      (v24/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v26 = {
  "kind": "Variable",
  "name": "domainName",
  "variableName": "domainName"
},
v27 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "projectFilter"
  },
  (v18/*: any*/),
  (v19/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "projectOrder"
  },
  {
    "fields": [
      (v26/*: any*/),
      (v24/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v28 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "userFilter"
  },
  (v18/*: any*/),
  (v19/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "userOrder"
  },
  {
    "fields": [
      (v26/*: any*/),
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectIdStr"
      },
      (v24/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v29 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v30 = [
  (v22/*: any*/)
],
v31 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v30/*: any*/),
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weight",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "usesDefault",
  "storageKey": null
},
v36 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": [
      (v33/*: any*/),
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
v37 = {
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
      "selections": (v30/*: any*/),
      "storageKey": null
    },
    (v32/*: any*/)
  ],
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceGroupName",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domainName",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "concreteType": "FairShareSpec",
  "kind": "LinkedField",
  "name": "spec",
  "plural": false,
  "selections": [
    (v34/*: any*/),
    (v35/*: any*/)
  ],
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fairShareFactor",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceSlot",
  "kind": "LinkedField",
  "name": "averageDailyDecayedUsage",
  "plural": false,
  "selections": (v36/*: any*/),
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceGroup",
  "kind": "LinkedField",
  "name": "resourceGroup",
  "plural": false,
  "selections": [
    (v22/*: any*/),
    (v32/*: any*/)
  ],
  "storageKey": null
},
v46 = [
  (v31/*: any*/),
  (v32/*: any*/)
],
v47 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": (v46/*: any*/),
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "concreteType": "FairShareCalculationSnapshot",
  "kind": "LinkedField",
  "name": "calculationSnapshot",
  "plural": false,
  "selections": [
    (v41/*: any*/),
    (v42/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FairShareListQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v20/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          (v21/*: any*/),
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
                  (v22/*: any*/),
                  (v23/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ResourceGroupFairShareTableFragment"
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
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": "domainFairShares",
              "args": (v25/*: any*/),
              "concreteType": "DomainFairShareConnection",
              "kind": "LinkedField",
              "name": "rgDomainFairShares",
              "plural": false,
              "selections": [
                (v21/*: any*/),
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
        ]
      },
      {
        "condition": "skipProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": "projectFairShares",
              "args": (v27/*: any*/),
              "concreteType": "ProjectFairShareConnection",
              "kind": "LinkedField",
              "name": "rgProjectFairShares",
              "plural": false,
              "selections": [
                (v21/*: any*/),
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
        ]
      },
      {
        "condition": "skipUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": "userFairShares",
              "args": (v28/*: any*/),
              "concreteType": "UserFairShareConnection",
              "kind": "LinkedField",
              "name": "rgUserFairShares",
              "plural": false,
              "selections": [
                (v21/*: any*/),
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
        ]
      },
      {
        "condition": "skipParentProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project",
            "args": (v29/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v31/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v10/*: any*/),
      (v1/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v9/*: any*/),
      (v11/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v8/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v12/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v13/*: any*/)
    ],
    "kind": "Operation",
    "name": "FairShareListQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v20/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          (v21/*: any*/),
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
                  (v22/*: any*/),
                  (v23/*: any*/),
                  (v32/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FairShareScalingGroupSpec",
                    "kind": "LinkedField",
                    "name": "fairShareSpec",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "halfLifeDays",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "lookbackDays",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "decayUnitDays",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "defaultWeight",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceWeightEntry",
                        "kind": "LinkedField",
                        "name": "resourceWeights",
                        "plural": true,
                        "selections": [
                          (v33/*: any*/),
                          (v34/*: any*/),
                          (v35/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceInfo",
                    "kind": "LinkedField",
                    "name": "resourceInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "capacity",
                        "plural": false,
                        "selections": (v36/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "used",
                        "plural": false,
                        "selections": (v36/*: any*/),
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
        "storageKey": null
      },
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "domainFairShares",
            "args": (v25/*: any*/),
            "concreteType": "DomainFairShareConnection",
            "kind": "LinkedField",
            "name": "rgDomainFairShares",
            "plural": false,
            "selections": [
              (v21/*: any*/),
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
                      (v37/*: any*/),
                      (v32/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v40/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FairShareCalculationSnapshot",
                        "kind": "LinkedField",
                        "name": "calculationSnapshot",
                        "plural": false,
                        "selections": [
                          (v41/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "normalizedUsage",
                            "storageKey": null
                          },
                          (v42/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v43/*: any*/),
                      (v44/*: any*/),
                      (v45/*: any*/)
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
      {
        "condition": "skipProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "projectFairShares",
            "args": (v27/*: any*/),
            "concreteType": "ProjectFairShareConnection",
            "kind": "LinkedField",
            "name": "rgProjectFairShares",
            "plural": false,
            "selections": [
              (v21/*: any*/),
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
                      (v47/*: any*/),
                      (v32/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v48/*: any*/),
                      (v40/*: any*/),
                      (v49/*: any*/),
                      (v43/*: any*/),
                      (v44/*: any*/),
                      (v45/*: any*/),
                      (v37/*: any*/)
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
      {
        "condition": "skipUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "userFairShares",
            "args": (v28/*: any*/),
            "concreteType": "UserFairShareConnection",
            "kind": "LinkedField",
            "name": "rgUserFairShares",
            "plural": false,
            "selections": [
              (v21/*: any*/),
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
                          (v32/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v32/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v48/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "userUuid",
                        "storageKey": null
                      },
                      (v40/*: any*/),
                      (v49/*: any*/),
                      (v43/*: any*/),
                      (v44/*: any*/),
                      (v45/*: any*/),
                      (v37/*: any*/),
                      (v47/*: any*/)
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
      {
        "condition": "skipParentProject",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project",
            "args": (v29/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": (v46/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "0b549824e8b7ef298cb1adc77e6a679a",
    "id": null,
    "metadata": {},
    "name": "FairShareListQuery",
    "operationKind": "query",
    "text": "query FairShareListQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n  $projectId: UUID!\n  $projectIdStr: String!\n  $resourceGroupFilter: ResourceGroupFilter\n  $resourceGroupOrder: [ResourceGroupOrderBy!]\n  $domainFilter: RGDomainFairShareFilter\n  $domainOrder: [DomainFairShareOrderBy!]\n  $projectFilter: RGProjectFairShareFilter\n  $projectOrder: [ProjectFairShareOrderBy!]\n  $userFilter: RGUserFairShareFilter\n  $userOrder: [UserFairShareOrderBy!]\n  $limit: Int\n  $offset: Int\n  $skipDomain: Boolean!\n  $skipProject: Boolean!\n  $skipUser: Boolean!\n  $skipParentProject: Boolean!\n) {\n  resourceGroups: adminResourceGroups(filter: $resourceGroupFilter, orderBy: $resourceGroupOrder, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        name\n        scheduler {\n          type\n        }\n        ...ResourceGroupFairShareTableFragment\n        ...FairShareWeightSettingModal_ResourceGroupFragment\n        id\n      }\n    }\n  }\n  domainFairShares: rgDomainFairShares(scope: {resourceGroupName: $resourceGroupName}, filter: $domainFilter, orderBy: $domainOrder, limit: $limit, offset: $offset) @skip(if: $skipDomain) {\n    count\n    edges {\n      node {\n        ...DomainFairShareTableFragment\n        id\n      }\n    }\n  }\n  projectFairShares: rgProjectFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName}, filter: $projectFilter, orderBy: $projectOrder, limit: $limit, offset: $offset) @skip(if: $skipProject) {\n    count\n    edges {\n      node {\n        ...ProjectFairShareTableFragment\n        id\n      }\n    }\n  }\n  userFairShares: rgUserFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName, projectId: $projectIdStr}, filter: $userFilter, orderBy: $userOrder, limit: $limit, offset: $offset) @skip(if: $skipUser) {\n    count\n    edges {\n      node {\n        ...UserFairShareTableFragment\n        id\n      }\n    }\n  }\n  project: projectV2(projectId: $projectId) @skip(if: $skipParentProject) {\n    basicInfo {\n      name\n    }\n    id\n  }\n}\n\nfragment DomainFairShareTableFragment on DomainFairShare {\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    normalizedUsage\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...DomainResourceGroupWarningIconFragment\n  ...FairShareWeightSettingModal_DomainFragment\n  ...UsageBucketModal_DomainFragment\n}\n\nfragment DomainResourceGroupAlertFragment on DomainFairShare {\n  domainName\n  resourceGroupName\n}\n\nfragment DomainResourceGroupWarningIconFragment on DomainFairShare {\n  domainName\n  resourceGroupName\n}\n\nfragment FairShareWeightSettingModal_DomainFragment on DomainFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  spec {\n    weight\n  }\n  ...DomainResourceGroupAlertFragment\n}\n\nfragment FairShareWeightSettingModal_ProjectFragment on ProjectFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  projectId\n  spec {\n    weight\n  }\n  ...ProjectResourceGroupAlertFragment\n}\n\nfragment FairShareWeightSettingModal_ResourceGroupFragment on ResourceGroup {\n  scheduler {\n    type\n  }\n  name\n}\n\nfragment FairShareWeightSettingModal_UserFragment on UserFairShare {\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  user {\n    basicInfo {\n      email\n    }\n    id\n  }\n  id\n  projectId\n  userUuid\n  spec {\n    weight\n  }\n}\n\nfragment ProjectFairShareTableFragment on ProjectFairShare {\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  projectId\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...ProjectResourceGroupWarningIconFragment\n  ...FairShareWeightSettingModal_ProjectFragment\n  ...UsageBucketModal_ProjectFragment\n}\n\nfragment ProjectResourceGroupAlertFragment on ProjectFairShare {\n  projectId\n  domainName\n  resourceGroupName\n}\n\nfragment ProjectResourceGroupWarningIconFragment on ProjectFairShare {\n  projectId\n  domainName\n  resourceGroupName\n}\n\nfragment ResourceGroupFairShareSettingModalFragment on ResourceGroup {\n  name\n  fairShareSpec {\n    decayUnitDays\n    halfLifeDays\n    lookbackDays\n    defaultWeight\n    resourceWeights {\n      resourceType\n      weight\n      usesDefault\n    }\n  }\n}\n\nfragment ResourceGroupFairShareTableFragment on ResourceGroup {\n  id\n  name\n  fairShareSpec {\n    halfLifeDays\n    lookbackDays\n    decayUnitDays\n    defaultWeight\n    resourceWeights {\n      resourceType\n      weight\n      usesDefault\n    }\n  }\n  resourceInfo {\n    capacity {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n    used {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  ...ResourceGroupFairShareSettingModalFragment\n}\n\nfragment UsageBucketChartContent_DomainFragment on DomainFairShare {\n  id\n  domainName\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketChartContent_ProjectFragment on ProjectFairShare {\n  id\n  domainName\n  projectId\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketChartContent_UserFragment on UserFairShare {\n  id\n  domainName\n  projectId\n  userUuid\n  resourceGroup {\n    name\n    id\n  }\n}\n\nfragment UsageBucketModal_DomainFragment on DomainFairShare {\n  id\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  resourceGroup {\n    name\n    id\n  }\n  ...UsageBucketChartContent_DomainFragment\n}\n\nfragment UsageBucketModal_ProjectFragment on ProjectFairShare {\n  id\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  ...UsageBucketChartContent_ProjectFragment\n}\n\nfragment UsageBucketModal_UserFragment on UserFairShare {\n  id\n  resourceGroup {\n    name\n    id\n  }\n  domain {\n    basicInfo {\n      name\n    }\n    id\n  }\n  project {\n    basicInfo {\n      name\n    }\n    id\n  }\n  user {\n    basicInfo {\n      email\n    }\n    id\n  }\n  ...UsageBucketChartContent_UserFragment\n}\n\nfragment UserFairShareTableFragment on UserFairShare {\n  user {\n    basicInfo {\n      username\n      email\n    }\n    id\n  }\n  id\n  resourceGroupName\n  domainName\n  projectId\n  userUuid\n  spec {\n    weight\n    usesDefault\n  }\n  calculationSnapshot {\n    fairShareFactor\n    averageDailyDecayedUsage {\n      entries {\n        resourceType\n        quantity\n      }\n    }\n  }\n  createdAt\n  updatedAt\n  ...FairShareWeightSettingModal_UserFragment\n  ...UsageBucketModal_UserFragment\n}\n"
  }
};
})();

(node as any).hash = "da2cc2e8b057f20bd35d71620922b96c";

export default node;
