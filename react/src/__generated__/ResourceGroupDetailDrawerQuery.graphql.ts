/**
 * @generated SignedSource<<6b81eeeb03b819e7a0499a1773e58f50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
export type ResourceGroupFilter = {
  AND?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  NOT?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  OR?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  description?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isDefault?: boolean | null | undefined;
  isPublic?: boolean | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
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
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type ResourceGroupDetailDrawerQuery$variables = {
  filter?: ResourceGroupFilter | null | undefined;
  name: string;
};
export type ResourceGroupDetailDrawerQuery$data = {
  readonly adminResourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metadata: {
          readonly createdAt: string;
          readonly description: string | null | undefined;
        };
        readonly name: string;
        readonly network: {
          readonly wsproxyAddr: string | null | undefined;
        };
        readonly scheduler: {
          readonly type: SchedulerType;
        };
        readonly status: {
          readonly isActive: boolean;
          readonly isDefault: boolean;
          readonly isPublic: boolean;
        };
        readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsPanelFragment" | "ResourceGroupDefaultSessionOptionsPanelFragment">;
      };
    }>;
  } | null | undefined;
  readonly scaling_group: {
    readonly scheduler_opts: string | null | undefined;
  } | null | undefined;
};
export type ResourceGroupDetailDrawerQuery = {
  response: ResourceGroupDetailDrawerQuery$data;
  variables: ResourceGroupDetailDrawerQuery$variables;
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
  "name": "name"
},
v2 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
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
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceGroupStatus",
  "kind": "LinkedField",
  "name": "status",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isActive",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPublic",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isDefault",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceGroupMetadata",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceGroupNetworkConfig",
  "kind": "LinkedField",
  "name": "network",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "wsproxyAddr",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
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
v9 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "name",
      "variableName": "name"
    }
  ],
  "concreteType": "ScalingGroup",
  "kind": "LinkedField",
  "name": "scaling_group",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scheduler_opts",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timeoutSec",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxRetryCount",
  "storageKey": null
},
v12 = [
  (v10/*: any*/),
  (v11/*: any*/)
],
v13 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "handlerName",
    "storageKey": null
  },
  (v10/*: any*/),
  (v11/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupDetailDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ResourceGroupDefaultSessionOptionsPanelFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ResourceGroupDefaultDeploymentOptionsPanelFragment"
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
      (v9/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceGroupDetailDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DefaultSessionOptionsInfo",
                    "kind": "LinkedField",
                    "name": "defaultSessionOptions",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "priority",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isPreemptible",
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
                        "name": "defaultFailurePolicy",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "agentSelectionPolicy",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DefaultSessionHandlerOptionsPolicyInfo",
                        "kind": "LinkedField",
                        "name": "handlerOptions",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DefaultSessionHandlerOptionsInfo",
                            "kind": "LinkedField",
                            "name": "default",
                            "plural": false,
                            "selections": (v12/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DefaultSessionHandlerOptionsEntryInfo",
                            "kind": "LinkedField",
                            "name": "byHandler",
                            "plural": true,
                            "selections": (v13/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DefaultSessionKernelExecutionSpecInfo",
                        "kind": "LinkedField",
                        "name": "defaultKernelExecutionSpec",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "imageId",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceSlotEntry",
                            "kind": "LinkedField",
                            "name": "resources",
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
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DefaultSessionResourceOptsInfo",
                            "kind": "LinkedField",
                            "name": "resourceOpts",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "shmem",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startupCommand",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "bootstrapScript",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startsAt",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "batchTimeoutSec",
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
                    "concreteType": "DeploymentOptionsInfo",
                    "kind": "LinkedField",
                    "name": "defaultDeploymentOptions",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DeploymentHandlerOptionsInfo",
                        "kind": "LinkedField",
                        "name": "handlerOptions",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HandlerOptionsInfo",
                            "kind": "LinkedField",
                            "name": "default",
                            "plural": false,
                            "selections": (v12/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HandlerOptionsEntryInfo",
                            "kind": "LinkedField",
                            "name": "byHandler",
                            "plural": true,
                            "selections": (v13/*: any*/),
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
      },
      (v9/*: any*/)
    ]
  },
  "params": {
    "cacheID": "c9d35d14d76ac59c623452534ad94d9f",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDetailDrawerQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDetailDrawerQuery(\n  $name: String!\n  $filter: ResourceGroupFilter\n) {\n  adminResourceGroups(filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n        name\n        status {\n          isActive\n          isPublic\n          isDefault\n        }\n        metadata {\n          description\n          createdAt\n        }\n        network {\n          wsproxyAddr\n        }\n        scheduler {\n          type\n        }\n        ...ResourceGroupDefaultSessionOptionsPanelFragment\n        ...ResourceGroupDefaultDeploymentOptionsPanelFragment\n      }\n    }\n  }\n  scaling_group(name: $name) {\n    scheduler_opts\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsModalFragment on ResourceGroup {\n  id\n  name\n  defaultDeploymentOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultDeploymentOptionsModal_options\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsModal_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsPanelFragment on ResourceGroup {\n  defaultDeploymentOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultDeploymentOptionsPanel_options\n  }\n  ...ResourceGroupDefaultDeploymentOptionsModalFragment\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsPanel_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsModalFragment on ResourceGroup {\n  id\n  name\n  defaultSessionOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultSessionOptionsModal_options\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsModal_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsPanelFragment on ResourceGroup {\n  defaultSessionOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultSessionOptionsPanel_options\n  }\n  ...ResourceGroupDefaultSessionOptionsModalFragment\n}\n\nfragment ResourceGroupDefaultSessionOptionsPanel_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f3aae45183bdd0f0362b1f059c863bd";

export default node;
