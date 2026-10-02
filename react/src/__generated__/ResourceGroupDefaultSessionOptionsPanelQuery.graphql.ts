/**
 * @generated SignedSource<<2e21da6e071b26db1807e410e2b078eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
export type ResourceGroupDefaultSessionOptionsPanelQuery$variables = {
  filter?: ResourceGroupFilter | null | undefined;
};
export type ResourceGroupDefaultSessionOptionsPanelQuery$data = {
  readonly adminResourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsPanelFragment">;
      };
    }>;
  } | null | undefined;
};
export type ResourceGroupDefaultSessionOptionsPanelQuery = {
  response: ResourceGroupDefaultSessionOptionsPanelQuery$data;
  variables: ResourceGroupDefaultSessionOptionsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timeoutSec",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxRetryCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupDefaultSessionOptionsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                    "name": "ResourceGroupDefaultSessionOptionsPanelFragment"
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
    "name": "ResourceGroupDefaultSessionOptionsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                            "selections": [
                              (v2/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DefaultSessionHandlerOptionsEntryInfo",
                            "kind": "LinkedField",
                            "name": "byHandler",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "handlerName",
                                "storageKey": null
                              },
                              (v2/*: any*/),
                              (v3/*: any*/)
                            ],
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
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
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
    "cacheID": "7172e02472eec5122bcc66cad7d30416",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDefaultSessionOptionsPanelQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDefaultSessionOptionsPanelQuery(\n  $filter: ResourceGroupFilter\n) {\n  adminResourceGroups(filter: $filter, first: 1) {\n    edges {\n      node {\n        ...ResourceGroupDefaultSessionOptionsPanelFragment\n        id\n      }\n    }\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsModalFragment on ResourceGroup {\n  id\n  name\n  defaultSessionOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultSessionOptionsModal_options\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsModal_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsPanelFragment on ResourceGroup {\n  defaultSessionOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultSessionOptionsPanel_options\n  }\n  ...ResourceGroupDefaultSessionOptionsModalFragment\n}\n\nfragment ResourceGroupDefaultSessionOptionsPanel_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n"
  }
};
})();

(node as any).hash = "39b3cc90598dcd46d32b1ab4949792d9";

export default node;
