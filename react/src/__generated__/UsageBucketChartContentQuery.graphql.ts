/**
 * @generated SignedSource<<c797379542c10163658f0d1fd239394b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "%future added value";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type DomainV2Filter = {
  AND?: ReadonlyArray<DomainV2Filter> | null | undefined;
  NOT?: ReadonlyArray<DomainV2Filter> | null | undefined;
  OR?: ReadonlyArray<DomainV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  description?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  modifiedAt?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  project?: DomainProjectNestedFilter | null | undefined;
  user?: DomainUserNestedFilter | null | undefined;
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
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type DomainProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type DomainUserNestedFilter = {
  email?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
};
export type ProjectV2Filter = {
  AND?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  OR?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  domain?: ProjectDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isActive?: boolean | null | undefined;
  modifiedAt?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  type?: ProjectTypeV2EnumFilter | null | undefined;
  user?: ProjectUserNestedFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type ProjectTypeV2EnumFilter = {
  equals?: ProjectTypeV2 | null | undefined;
  in_?: ReadonlyArray<ProjectTypeV2> | null | undefined;
  notEquals?: ProjectTypeV2 | null | undefined;
  notIn?: ReadonlyArray<ProjectTypeV2> | null | undefined;
};
export type ProjectDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type ProjectUserNestedFilter = {
  email?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isActive?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
};
export type UserV2Filter = {
  AND?: ReadonlyArray<UserV2Filter> | null | undefined;
  NOT?: ReadonlyArray<UserV2Filter> | null | undefined;
  OR?: ReadonlyArray<UserV2Filter> | null | undefined;
  containerGids?: IntArrayFilter | null | undefined;
  containerMainGid?: IntFilter | null | undefined;
  containerUid?: IntFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  description?: StringFilter | null | undefined;
  domain?: UserDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  email?: StringFilter | null | undefined;
  fullName?: StringFilter | null | undefined;
  integrationName?: StringFilter | null | undefined;
  needPasswordChange?: boolean | null | undefined;
  project?: UserProjectNestedFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  role?: UserRoleV2EnumFilter | null | undefined;
  status?: UserStatusV2EnumFilter | null | undefined;
  statusInfo?: StringFilter | null | undefined;
  sudoSessionEnabled?: boolean | null | undefined;
  totpActivated?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
  uuid?: UUIDFilter | null | undefined;
};
export type UserStatusV2EnumFilter = {
  equals?: UserStatusV2 | null | undefined;
  in?: ReadonlyArray<UserStatusV2> | null | undefined;
  notEquals?: UserStatusV2 | null | undefined;
  notIn?: ReadonlyArray<UserStatusV2> | null | undefined;
};
export type UserRoleV2EnumFilter = {
  equals?: UserRoleV2 | null | undefined;
  in?: ReadonlyArray<UserRoleV2> | null | undefined;
  notEquals?: UserRoleV2 | null | undefined;
  notIn?: ReadonlyArray<UserRoleV2> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type IntArrayFilter = {
  contains?: number | null | undefined;
  containsAll?: ReadonlyArray<number> | null | undefined;
  containsAny?: ReadonlyArray<number> | null | undefined;
};
export type UserDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type UserProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type DateFilter = {
  after?: any | null | undefined;
  before?: any | null | undefined;
  equals?: any | null | undefined;
  notEquals?: any | null | undefined;
};
export type UsageBucketChartContentQuery$variables = {
  domainFilter?: DomainV2Filter | null | undefined;
  limit?: number | null | undefined;
  periodEnd?: DateFilter | null | undefined;
  periodStart?: DateFilter | null | undefined;
  projectFilter?: ProjectV2Filter | null | undefined;
  selectedProjectId: string;
  selectedResourceGroupName: string;
  skipDomain: boolean;
  skipProject: boolean;
  skipUser: boolean;
  userFilter?: UserV2Filter | null | undefined;
};
export type UsageBucketChartContentQuery$data = {
  readonly domains?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly usageBuckets: {
          readonly count: number;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly averageDailyUsage: {
                readonly entries: ReadonlyArray<{
                  readonly quantity: any;
                  readonly resourceType: string;
                }>;
              } | null | undefined;
              readonly domainName: string;
              readonly metadata: {
                readonly periodStart: any;
              };
            };
          }>;
        } | null | undefined;
      };
    }>;
  } | null | undefined;
  readonly projects?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
        readonly usageBuckets: {
          readonly count: number;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly averageDailyUsage: {
                readonly entries: ReadonlyArray<{
                  readonly quantity: any;
                  readonly resourceType: string;
                }>;
              } | null | undefined;
              readonly domainName: string;
              readonly metadata: {
                readonly periodStart: any;
              };
              readonly projectId: string;
            };
          }>;
        } | null | undefined;
      };
    }>;
  } | null | undefined;
  readonly resourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string;
        readonly resourceInfo: {
          readonly capacity: {
            readonly entries: ReadonlyArray<{
              readonly quantity: any;
              readonly resourceType: string;
            }>;
          };
        } | null | undefined;
      };
    }>;
  } | null | undefined;
  readonly users?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
        };
        readonly id: string;
        readonly usageBuckets: {
          readonly count: number;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly averageDailyUsage: {
                readonly entries: ReadonlyArray<{
                  readonly quantity: any;
                  readonly resourceType: string;
                }>;
              } | null | undefined;
              readonly domainName: string;
              readonly metadata: {
                readonly periodStart: any;
              };
              readonly projectId: string;
              readonly userUuid: string;
            };
          }>;
        } | null | undefined;
      };
    }>;
  } | null | undefined;
};
export type UsageBucketChartContentQuery = {
  response: UsageBucketChartContentQuery$data;
  variables: UsageBucketChartContentQuery$variables;
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
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "periodEnd"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "periodStart"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedProjectId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedResourceGroupName"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipDomain"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProject"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipUser"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userFilter"
},
v11 = [
  {
    "fields": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "equals",
            "variableName": "selectedResourceGroupName"
          }
        ],
        "kind": "ObjectValue",
        "name": "name"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v15 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": [
      (v13/*: any*/),
      (v14/*: any*/)
    ],
    "storageKey": null
  }
],
v16 = {
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
      "selections": (v15/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v17 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "domainFilter"
  }
],
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v20 = {
  "fields": [
    {
      "kind": "Variable",
      "name": "periodEnd",
      "variableName": "periodEnd"
    },
    {
      "kind": "Variable",
      "name": "periodStart",
      "variableName": "periodStart"
    }
  ],
  "kind": "ObjectValue",
  "name": "filter"
},
v21 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v22 = {
  "kind": "Literal",
  "name": "orderBy",
  "value": [
    {
      "direction": "ASC",
      "field": "PERIOD_START"
    }
  ]
},
v23 = {
  "kind": "Variable",
  "name": "resourceGroupName",
  "variableName": "selectedResourceGroupName"
},
v24 = [
  (v20/*: any*/),
  (v21/*: any*/),
  (v22/*: any*/),
  {
    "fields": [
      (v23/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domainName",
  "storageKey": null
},
v26 = {
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
v27 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceSlot",
  "kind": "LinkedField",
  "name": "averageDailyUsage",
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
        (v14/*: any*/),
        (v13/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v28 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "projectFilter"
  }
],
v29 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    (v12/*: any*/)
  ],
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceSlot",
  "kind": "LinkedField",
  "name": "averageDailyUsage",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v32 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "userFilter"
  }
],
v33 = {
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
    }
  ],
  "storageKey": null
},
v34 = [
  (v20/*: any*/),
  (v21/*: any*/),
  (v22/*: any*/),
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "selectedProjectId"
      },
      (v23/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userUuid",
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
      (v10/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UsageBucketChartContentQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v11/*: any*/),
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
                  (v12/*: any*/),
                  (v16/*: any*/)
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
            "alias": "domains",
            "args": (v17/*: any*/),
            "concreteType": "DomainV2Connection",
            "kind": "LinkedField",
            "name": "adminDomainsV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "DomainV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DomainV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      {
                        "alias": null,
                        "args": (v24/*: any*/),
                        "concreteType": "DomainUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DomainUsageBucketEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "DomainUsageBucket",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v25/*: any*/),
                                  (v26/*: any*/),
                                  (v27/*: any*/)
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
            "alias": "projects",
            "args": (v28/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "adminProjectsV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
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
                      (v19/*: any*/),
                      (v29/*: any*/),
                      {
                        "alias": null,
                        "args": (v24/*: any*/),
                        "concreteType": "ProjectUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
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
                                  (v25/*: any*/),
                                  (v30/*: any*/),
                                  (v26/*: any*/),
                                  (v31/*: any*/)
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
            "alias": "users",
            "args": (v32/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "adminUsersV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      (v33/*: any*/),
                      {
                        "alias": null,
                        "args": (v34/*: any*/),
                        "concreteType": "UserUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserUsageBucketEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "UserUsageBucket",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v25/*: any*/),
                                  (v30/*: any*/),
                                  (v35/*: any*/),
                                  (v26/*: any*/),
                                  (v27/*: any*/)
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
                "storageKey": null
              }
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
      (v0/*: any*/),
      (v4/*: any*/),
      (v10/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "UsageBucketChartContentQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v11/*: any*/),
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
                  (v12/*: any*/),
                  (v16/*: any*/),
                  (v19/*: any*/)
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
            "alias": "domains",
            "args": (v17/*: any*/),
            "concreteType": "DomainV2Connection",
            "kind": "LinkedField",
            "name": "adminDomainsV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "DomainV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DomainV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      {
                        "alias": null,
                        "args": (v24/*: any*/),
                        "concreteType": "DomainUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DomainUsageBucketEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "DomainUsageBucket",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v25/*: any*/),
                                  (v26/*: any*/),
                                  (v27/*: any*/),
                                  (v19/*: any*/)
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
            "alias": "projects",
            "args": (v28/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "adminProjectsV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
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
                      (v19/*: any*/),
                      (v29/*: any*/),
                      {
                        "alias": null,
                        "args": (v24/*: any*/),
                        "concreteType": "ProjectUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
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
                                  (v25/*: any*/),
                                  (v30/*: any*/),
                                  (v26/*: any*/),
                                  (v31/*: any*/),
                                  (v19/*: any*/)
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
            "alias": "users",
            "args": (v32/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "adminUsersV2",
            "plural": false,
            "selections": [
              (v18/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      (v33/*: any*/),
                      {
                        "alias": null,
                        "args": (v34/*: any*/),
                        "concreteType": "UserUsageBucketConnection",
                        "kind": "LinkedField",
                        "name": "usageBuckets",
                        "plural": false,
                        "selections": [
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserUsageBucketEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "UserUsageBucket",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v25/*: any*/),
                                  (v30/*: any*/),
                                  (v35/*: any*/),
                                  (v26/*: any*/),
                                  (v27/*: any*/),
                                  (v19/*: any*/)
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
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "e6efaed3d7a14f97c64adb5c3676714c",
    "id": null,
    "metadata": {},
    "name": "UsageBucketChartContentQuery",
    "operationKind": "query",
    "text": "query UsageBucketChartContentQuery(\n  $domainFilter: DomainV2Filter\n  $projectFilter: ProjectV2Filter\n  $userFilter: UserV2Filter\n  $skipDomain: Boolean!\n  $skipProject: Boolean!\n  $skipUser: Boolean!\n  $periodStart: DateFilter\n  $periodEnd: DateFilter\n  $selectedResourceGroupName: String!\n  $selectedProjectId: UUID!\n  $limit: Int\n) {\n  resourceGroups: adminResourceGroups(filter: {name: {equals: $selectedResourceGroupName}}) {\n    edges {\n      node {\n        name\n        resourceInfo {\n          capacity {\n            entries {\n              quantity\n              resourceType\n            }\n          }\n        }\n        id\n      }\n    }\n  }\n  domains: adminDomainsV2(filter: $domainFilter) @skip(if: $skipDomain) {\n    count\n    edges {\n      node {\n        id\n        usageBuckets(scope: {resourceGroupName: $selectedResourceGroupName}, filter: {periodStart: $periodStart, periodEnd: $periodEnd}, orderBy: [{field: PERIOD_START, direction: ASC}], limit: $limit) {\n          count\n          edges {\n            node {\n              domainName\n              metadata {\n                periodStart\n              }\n              averageDailyUsage {\n                entries {\n                  resourceType\n                  quantity\n                }\n              }\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n  projects: adminProjectsV2(filter: $projectFilter) @skip(if: $skipProject) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n        usageBuckets(scope: {resourceGroupName: $selectedResourceGroupName}, filter: {periodStart: $periodStart, periodEnd: $periodEnd}, orderBy: [{field: PERIOD_START, direction: ASC}], limit: $limit) {\n          count\n          edges {\n            node {\n              domainName\n              projectId\n              metadata {\n                periodStart\n              }\n              averageDailyUsage {\n                entries {\n                  quantity\n                  resourceType\n                }\n              }\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n  users: adminUsersV2(filter: $userFilter) @skip(if: $skipUser) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n        }\n        usageBuckets(scope: {resourceGroupName: $selectedResourceGroupName, projectId: $selectedProjectId}, filter: {periodStart: $periodStart, periodEnd: $periodEnd}, orderBy: [{field: PERIOD_START, direction: ASC}], limit: $limit) {\n          count\n          edges {\n            node {\n              domainName\n              projectId\n              userUuid\n              metadata {\n                periodStart\n              }\n              averageDailyUsage {\n                entries {\n                  resourceType\n                  quantity\n                }\n              }\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "21e0bc965f48a12e11c57edafe66dec7";

export default node;
