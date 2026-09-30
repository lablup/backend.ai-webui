/**
 * @generated SignedSource<<d6126189f9e68bfc495ffda4b4ec9a65>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryType = "DOCKER" | "ECR" | "ECR_PUB" | "GITHUB" | "GITLAB" | "HARBOR" | "HARBOR2" | "LOCAL" | "OCP" | "%future added value";
export type ContainerRegistryV2Filter = {
  AND?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
  OR?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
  isGlobal?: boolean | null | undefined;
  registryName?: StringFilter | null | undefined;
  type?: ContainerRegistryTypeFilter | null | undefined;
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
export type ContainerRegistryTypeFilter = {
  equals?: ContainerRegistryType | null | undefined;
  in_?: ReadonlyArray<ContainerRegistryType> | null | undefined;
  notEquals?: ContainerRegistryType | null | undefined;
  notIn?: ReadonlyArray<ContainerRegistryType> | null | undefined;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery$variables = {
  filter?: string | null | undefined;
  filterV2?: ContainerRegistryV2Filter | null | undefined;
  limit: number;
  offset: number;
  useV2: boolean;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery$data = {
  readonly adminContainerRegistriesV2?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registryName: string;
      };
    }>;
  } | null | undefined;
  readonly container_registry_nodes?: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery = {
  response: BAIAdminContainerRegistrySelectPaginatedQuery$data;
  variables: BAIAdminContainerRegistrySelectPaginatedQuery$variables;
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
  "name": "filterV2"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useV2"
},
v5 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v9 = [
  {
    "condition": "useV2",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "filter"
          },
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "limit"
          },
          (v5/*: any*/),
          {
            "kind": "Literal",
            "name": "order",
            "value": "registry_name"
          }
        ],
        "concreteType": "ContainerRegistryConnection",
        "kind": "LinkedField",
        "name": "container_registry_nodes",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "registry_name",
                    "storageKey": null
                  },
                  (v8/*: any*/)
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
    "condition": "useV2",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "filterV2"
          },
          {
            "kind": "Variable",
            "name": "limit",
            "variableName": "limit"
          },
          (v5/*: any*/),
          {
            "kind": "Literal",
            "name": "orderBy",
            "value": [
              {
                "direction": "ASC",
                "field": "REGISTRY_NAME"
              }
            ]
          }
        ],
        "concreteType": "ContainerRegistryV2Connection",
        "kind": "LinkedField",
        "name": "adminContainerRegistriesV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
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
                    "kind": "ScalarField",
                    "name": "registryName",
                    "storageKey": null
                  },
                  (v8/*: any*/)
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "selections": (v9/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "selections": (v9/*: any*/)
  },
  "params": {
    "cacheID": "35ebe30b315b7b3719a2faf6bc98337f",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n  $filterV2: ContainerRegistryV2Filter\n  $useV2: Boolean!\n) {\n  container_registry_nodes(offset: $offset, first: $limit, filter: $filter, order: \"registry_name\") @skip(if: $useV2) {\n    count\n    edges {\n      node {\n        id\n        row_id\n        registry_name\n        project\n      }\n    }\n  }\n  adminContainerRegistriesV2(offset: $offset, limit: $limit, filter: $filterV2, orderBy: [{field: REGISTRY_NAME, direction: ASC}]) @include(if: $useV2) @since(version: \"26.4.2\") {\n    count\n    edges {\n      node {\n        id\n        entityId @since(version: \"26.9.0\")\n        registryName\n        project\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7cb38ebda91a94132c5ddd0ad14286b6";

export default node;
