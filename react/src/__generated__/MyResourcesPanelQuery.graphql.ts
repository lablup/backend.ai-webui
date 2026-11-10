/**
 * @generated SignedSource<<9668df0c48fb4e54d8246ad17f0b9421>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type ResourceGroupScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type ResourceGroupFilter = {
  AND?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  NOT?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  OR?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
  description?: StringFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
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
  fieldId?: UUIDFilter | null | undefined;
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type MyResourcesPanelQuery$variables = {
  projectId: string;
  resourceGroupFilter: ResourceGroupFilter;
  scope: ResourceGroupScope;
};
export type MyResourcesPanelQuery$data = {
  readonly myUserResourceAllocationV2: Result<{
    readonly user: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined, unknown>;
  readonly projectResourceAllocationV2: Result<{
    readonly project: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
    };
  } | null | undefined, unknown>;
  readonly scopedResourceGroups: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly resourceInfo: {
          readonly capacity: {
            readonly entries: ReadonlyArray<{
              readonly quantity: any;
              readonly resourceType: string;
            }>;
          };
          readonly free: {
            readonly entries: ReadonlyArray<{
              readonly quantity: any;
              readonly resourceType: string;
            }>;
          };
        } | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
};
export type MyResourcesPanelQuery = {
  response: MyResourcesPanelQuery$data;
  variables: MyResourcesPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v5 = [
  (v3/*: any*/),
  (v4/*: any*/)
],
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": [
    (v3/*: any*/),
    (v4/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unlimited",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "UserResourceAllocationV2",
  "kind": "LinkedField",
  "name": "myUserResourceAllocationV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ScopeResourceUsageV2",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlotEntry",
          "kind": "LinkedField",
          "name": "used",
          "plural": true,
          "selections": (v5/*: any*/),
          "storageKey": null
        },
        (v6/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "projectId",
      "variableName": "projectId"
    }
  ],
  "concreteType": "ProjectResourceAllocationV2",
  "kind": "LinkedField",
  "name": "projectResourceAllocationV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ScopeResourceUsageV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        (v6/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "resourceGroupFilter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v10 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": (v5/*: any*/),
    "storageKey": null
  }
],
v11 = {
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
      "selections": (v10/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceSlot",
      "kind": "LinkedField",
      "name": "free",
      "plural": false,
      "selections": (v10/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MyResourcesPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v7/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v8/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v9/*: any*/),
          "concreteType": "ResourceGroupConnection",
          "kind": "LinkedField",
          "name": "scopedResourceGroups",
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
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "MyResourcesPanelQuery",
    "selections": [
      (v7/*: any*/),
      (v8/*: any*/),
      {
        "alias": null,
        "args": (v9/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "scopedResourceGroups",
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
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
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
    "cacheID": "cb68bdb0dc14c933f36f253d98c3ee72",
    "id": null,
    "metadata": {},
    "name": "MyResourcesPanelQuery",
    "operationKind": "query",
    "text": "query MyResourcesPanelQuery(\n  $projectId: UUID!\n  $scope: ResourceGroupScope!\n  $resourceGroupFilter: ResourceGroupFilter!\n) {\n  myUserResourceAllocationV2 {\n    user {\n      used {\n        resourceType\n        quantity\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  scopedResourceGroups(scope: $scope, filter: $resourceGroupFilter, limit: 1) {\n    edges {\n      node {\n        resourceInfo {\n          capacity {\n            entries {\n              resourceType\n              quantity\n            }\n          }\n          free {\n            entries {\n              resourceType\n              quantity\n            }\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f66ca02c9694d5ef12031cb600344926";

export default node;
