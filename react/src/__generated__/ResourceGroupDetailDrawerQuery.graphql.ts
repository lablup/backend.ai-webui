/**
 * @generated SignedSource<<f22dc3dfa83db2b9a4e0064d8904ef03>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
          readonly isPublic: boolean;
        };
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
    "alias": null,
    "args": [
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
              },
              {
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
                  }
                ],
                "storageKey": null
              },
              {
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
              {
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
  }
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
    "selections": (v2/*: any*/),
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
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b1313a5f8cdf4476ea02293b14fc2d19",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDetailDrawerQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDetailDrawerQuery(\n  $name: String!\n  $filter: ResourceGroupFilter\n) {\n  adminResourceGroups(filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n        name\n        status {\n          isActive\n          isPublic\n        }\n        metadata {\n          description\n          createdAt\n        }\n        network {\n          wsproxyAddr\n        }\n        scheduler {\n          type\n        }\n      }\n    }\n  }\n  scaling_group(name: $name) {\n    scheduler_opts\n  }\n}\n"
  }
};
})();

(node as any).hash = "f9375657e9034bddf63cd067341cd624";

export default node;
