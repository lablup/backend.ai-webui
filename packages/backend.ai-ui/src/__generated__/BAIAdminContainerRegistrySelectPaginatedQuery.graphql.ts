/**
 * @generated SignedSource<<b3c10683e8123da8d7a1ae5389524935>>
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
  filter?: ContainerRegistryV2Filter | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery$data = {
  readonly adminContainerRegistriesV2: {
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
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = [
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "project",
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
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "1617ae6e9a603f2339924b8b96537009",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: ContainerRegistryV2Filter\n) {\n  adminContainerRegistriesV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: REGISTRY_NAME, direction: ASC}]) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        registryName\n        project\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "409b53ba0e4ca053604fe3f9ef3f3c0d";

export default node;
