/**
 * @generated SignedSource<<7ed598e9cf716751709f65078dd20aeb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
export type MyResourceQuery$variables = {
  projectId: string;
  resourceGroupFilter: ResourceGroupFilter;
  scope: ResourceGroupScope;
};
export type MyResourceQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"MyResourceV2StatisticsFragment">;
};
export type MyResourceQuery = {
  response: MyResourceQuery$data;
  variables: MyResourceQuery$variables;
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
  "kind": "Variable",
  "name": "projectId",
  "variableName": "projectId"
},
v4 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v7 = [
  (v5/*: any*/),
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": [
    (v5/*: any*/),
    (v6/*: any*/),
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
v9 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": (v7/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MyResourceQuery",
    "selections": [
      {
        "args": [
          (v3/*: any*/),
          {
            "kind": "Variable",
            "name": "resourceGroupFilter",
            "variableName": "resourceGroupFilter"
          },
          (v4/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "MyResourceV2StatisticsFragment"
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
    "name": "MyResourceQuery",
    "selections": [
      {
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
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              (v8/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          (v3/*: any*/)
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
              (v8/*: any*/)
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
            "kind": "Variable",
            "name": "filter",
            "variableName": "resourceGroupFilter"
          },
          {
            "kind": "Literal",
            "name": "limit",
            "value": 1
          },
          (v4/*: any*/)
        ],
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
                        "selections": (v9/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceSlot",
                        "kind": "LinkedField",
                        "name": "free",
                        "plural": false,
                        "selections": (v9/*: any*/),
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
    "cacheID": "3e0586d80fff3947b1dd35f4f8aeb3c4",
    "id": null,
    "metadata": {},
    "name": "MyResourceQuery",
    "operationKind": "query",
    "text": "query MyResourceQuery(\n  $projectId: UUID!\n  $scope: ResourceGroupScope!\n  $resourceGroupFilter: ResourceGroupFilter!\n) {\n  ...MyResourceV2StatisticsFragment_3k2bJ9\n}\n\nfragment MyResourceV2StatisticsFragment_3k2bJ9 on Query {\n  myUserResourceAllocationV2 {\n    user {\n      used {\n        resourceType\n        quantity\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  scopedResourceGroups(scope: $scope, filter: $resourceGroupFilter, limit: 1) {\n    edges {\n      node {\n        resourceInfo {\n          capacity {\n            entries {\n              resourceType\n              quantity\n            }\n          }\n          free {\n            entries {\n              resourceType\n              quantity\n            }\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28f5c96c0297a5fcd8c5864d0e314435";

export default node;
