/**
 * @generated SignedSource<<bc7bb741b6b476a7997712f6ead2bb59>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
export type BAIScopedResourceGroupSelectQuery$variables = {
  filter?: ResourceGroupFilter | null | undefined;
  scope: ResourceGroupScope;
};
export type BAIScopedResourceGroupSelectQuery$data = {
  readonly scopedResourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type BAIScopedResourceGroupSelectQuery = {
  response: BAIScopedResourceGroupSelectQuery$data;
  variables: BAIScopedResourceGroupSelectQuery$variables;
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
  "name": "scope"
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
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "NAME"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIScopedResourceGroupSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/)
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIScopedResourceGroupSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
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
    "cacheID": "b89ae9ea8eecb7f51921bfa05c94f5c8",
    "id": null,
    "metadata": {},
    "name": "BAIScopedResourceGroupSelectQuery",
    "operationKind": "query",
    "text": "query BAIScopedResourceGroupSelectQuery(\n  $scope: ResourceGroupScope!\n  $filter: ResourceGroupFilter\n) {\n  scopedResourceGroups(scope: $scope, filter: $filter, orderBy: [{field: NAME, direction: ASC}], limit: 100) {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1c8fb072a583117bb5851f845807b45";

export default node;
