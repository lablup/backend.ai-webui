/**
 * @generated SignedSource<<4b1c0c2a893cefc2e100571173a19903>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionV2NetworkType = "HOST" | "PERSISTENT" | "VOLATILE" | "%future added value";
export type SessionV2Result = "FAILURE" | "SUCCESS" | "UNDEFINED" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RESERVED" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type SessionV2Filter = {
  AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
  NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
  OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  batchTimeout?: IntFilter | null | undefined;
  clusterSize?: IntFilter | null | undefined;
  creationId?: StringFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isPreemptible?: boolean | null | undefined;
  jobPriority?: IntFilter | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  networkId?: StringFilter | null | undefined;
  networkType?: SessionV2NetworkTypeFilter | null | undefined;
  priority?: IntFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  replicaId?: UUIDFilter | null | undefined;
  requestedStartsAt?: DateTimeFilter | null | undefined;
  resourceGroupName?: StringFilter | null | undefined;
  result?: SessionV2ResultFilter | null | undefined;
  sessionGroupId?: UUIDFilter | null | undefined;
  sessionType?: SessionV2TypeFilter | null | undefined;
  startsAt?: DateTimeFilter | null | undefined;
  status?: SessionV2StatusFilter | null | undefined;
  tag?: StringFilter | null | undefined;
  terminatedAt?: DateTimeFilter | null | undefined;
  tier?: IntFilter | null | undefined;
  useHostNetwork?: boolean | null | undefined;
  userUuid?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type SessionV2StatusFilter = {
  equals?: SessionV2Status | null | undefined;
  in?: ReadonlyArray<SessionV2Status> | null | undefined;
  notEquals?: SessionV2Status | null | undefined;
  notIn?: ReadonlyArray<SessionV2Status> | null | undefined;
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
export type EntityLabelNestedFilter = {
  every?: EntityLabelFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: EntityLabelFilter | null | undefined;
  some?: EntityLabelFilter | null | undefined;
};
export type EntityLabelFilter = {
  AND?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  OR?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type SessionV2TypeFilter = {
  equals?: SessionV2Type | null | undefined;
  in?: ReadonlyArray<SessionV2Type> | null | undefined;
  notEquals?: SessionV2Type | null | undefined;
  notIn?: ReadonlyArray<SessionV2Type> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type SessionV2ResultFilter = {
  equals?: SessionV2Result | null | undefined;
  in?: ReadonlyArray<SessionV2Result> | null | undefined;
  notEquals?: SessionV2Result | null | undefined;
  notIn?: ReadonlyArray<SessionV2Result> | null | undefined;
};
export type SessionV2NetworkTypeFilter = {
  equals?: SessionV2NetworkType | null | undefined;
  in?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
  notEquals?: SessionV2NetworkType | null | undefined;
  notIn?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
};
export type MyRecentSessionsPanelQuery$variables = {
  filter: SessionV2Filter;
  limit: number;
  offset: number;
};
export type MyRecentSessionsPanelQuery$data = {
  readonly mySessionsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionNodesV2Fragment">;
      };
    }>;
  } | null | undefined;
};
export type MyRecentSessionsPanelQuery = {
  response: MyRecentSessionsPanelQuery$data;
  variables: MyRecentSessionsPanelQuery$variables;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
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
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "CREATED_AT"
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
  "name": "name",
  "storageKey": null
},
v5 = [
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v8 = [
  (v6/*: any*/),
  (v7/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MyRecentSessionsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAISessionNodesV2Fragment"
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
    "name": "MyRecentSessionsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
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
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectBasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2MetadataInfo",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sessionType",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "clusterMode",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "clusterSize",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2LifecycleInfo",
                    "kind": "LinkedField",
                    "name": "lifecycle",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "status",
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
                        "name": "terminatedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2ResourceInfo",
                    "kind": "LinkedField",
                    "name": "resource",
                    "plural": false,
                    "selections": [
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
                        "concreteType": "ResourceAllocation",
                        "kind": "LinkedField",
                        "name": "allocation",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceSlot",
                            "kind": "LinkedField",
                            "name": "requested",
                            "plural": false,
                            "selections": (v5/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceSlot",
                            "kind": "LinkedField",
                            "name": "used",
                            "plural": false,
                            "selections": (v5/*: any*/),
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
                    "concreteType": "ImageV2Connection",
                    "kind": "LinkedField",
                    "name": "images",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ImageV2Edge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ImageV2",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageV2IdentityInfo",
                                "kind": "LinkedField",
                                "name": "identity",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "canonicalName",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "architecture",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageV2MetadataInfo",
                                "kind": "LinkedField",
                                "name": "metadata",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ImageV2TagEntry",
                                    "kind": "LinkedField",
                                    "name": "tags",
                                    "plural": true,
                                    "selections": (v8/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ImageV2LabelEntry",
                                    "kind": "LinkedField",
                                    "name": "labels",
                                    "plural": true,
                                    "selections": (v8/*: any*/),
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
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
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
                            "name": "email",
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
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "limit",
                        "value": 100
                      }
                    ],
                    "concreteType": "EntityLabelConnection",
                    "kind": "LinkedField",
                    "name": "entityLabels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "EntityLabelEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "EntityLabel",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "fieldId",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "entityLabels(limit:100)"
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
    "cacheID": "ed1be59adf0cc008f621d420f4d1198c",
    "id": null,
    "metadata": {},
    "name": "MyRecentSessionsPanelQuery",
    "operationKind": "query",
    "text": "query MyRecentSessionsPanelQuery(\n  $filter: SessionV2Filter!\n  $limit: Int!\n  $offset: Int!\n) {\n  mySessionsV2(filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAISessionNodesV2Fragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIEntityLabelSettingModalFragment on EntityLabelConnection {\n  edges {\n    node {\n      fieldId\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIEntityLabelTokensFragment on EntityLabelConnection {\n  edges {\n    node {\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n\nfragment BAISessionClusterModeV2Fragment on SessionV2MetadataInfo {\n  clusterMode\n  clusterSize\n}\n\nfragment BAISessionNodesV2Fragment on SessionV2 {\n  id\n  entityId\n  project {\n    id\n    basicInfo {\n      name\n    }\n  }\n  metadata {\n    name\n    ...BAISessionTypeTokenV2Fragment\n    ...BAISessionClusterModeV2Fragment\n  }\n  lifecycle {\n    status\n    createdAt\n    terminatedAt\n  }\n  resource {\n    resourceGroupName\n    allocation {\n      requested {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n      used {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n    }\n  }\n  images {\n    edges {\n      node {\n        id\n        ...BAIImageNodeSimpleTagV2Fragment\n      }\n    }\n  }\n  user {\n    id\n    basicInfo {\n      email\n    }\n  }\n  entityLabels(limit: 100) {\n    ...BAIEntityLabelTokensFragment\n    ...BAIEntityLabelSettingModalFragment\n  }\n}\n\nfragment BAISessionTypeTokenV2Fragment on SessionV2MetadataInfo {\n  sessionType\n}\n"
  }
};
})();

(node as any).hash = "10cca296f9c100ebbc3765fb5ab2c5f3";

export default node;
