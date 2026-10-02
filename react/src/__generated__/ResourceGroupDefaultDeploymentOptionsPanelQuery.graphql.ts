/**
 * @generated SignedSource<<0757d0b7272c45a1452cb2fa0a1dd91d>>
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
export type ResourceGroupDefaultDeploymentOptionsPanelQuery$variables = {
  filter?: ResourceGroupFilter | null | undefined;
};
export type ResourceGroupDefaultDeploymentOptionsPanelQuery$data = {
  readonly adminResourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsPanelFragment">;
      };
    }>;
  } | null | undefined;
};
export type ResourceGroupDefaultDeploymentOptionsPanelQuery = {
  response: ResourceGroupDefaultDeploymentOptionsPanelQuery$data;
  variables: ResourceGroupDefaultDeploymentOptionsPanelQuery$variables;
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
    "name": "last",
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
    "name": "ResourceGroupDefaultDeploymentOptionsPanelQuery",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupDefaultDeploymentOptionsPanelQuery",
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
                            "selections": [
                              (v2/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HandlerOptionsEntryInfo",
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
    "cacheID": "106a77a2fd1ccfd1fced47288302d879",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDefaultDeploymentOptionsPanelQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDefaultDeploymentOptionsPanelQuery(\n  $filter: ResourceGroupFilter\n) {\n  adminResourceGroups(filter: $filter, last: 1) {\n    edges {\n      node {\n        ...ResourceGroupDefaultDeploymentOptionsPanelFragment\n        id\n      }\n    }\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsModalFragment on ResourceGroup {\n  id\n  name\n  defaultDeploymentOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultDeploymentOptionsModal_options\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsModal_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsPanelFragment on ResourceGroup {\n  defaultDeploymentOptions @since(version: \"26.4.4rc1\") {\n    ...ResourceGroupDefaultDeploymentOptionsPanel_options\n  }\n  ...ResourceGroupDefaultDeploymentOptionsModalFragment\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsPanel_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "31327ffef7364b9a6498f9a3c54c3f96";

export default node;
