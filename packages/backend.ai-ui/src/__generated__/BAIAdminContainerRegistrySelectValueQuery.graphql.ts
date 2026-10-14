/**
 * @generated SignedSource<<06d256581aaaeefd9e62bb11c1f6d51c>>
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
  entityId?: UUIDFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
  limit: number;
  selectedFilter?: ContainerRegistryV2Filter | null | undefined;
  skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
  readonly adminContainerRegistriesV2?: {
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
export type BAIAdminContainerRegistrySelectValueQuery = {
  response: BAIAdminContainerRegistrySelectValueQuery$data;
  variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipSelected"
},
v3 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "selectedFilter"
          },
          {
            "kind": "Variable",
            "name": "limit",
            "variableName": "limit"
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
    ]
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
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "00239c041f1017f2fe8c6892943e7c68",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectValueQuery(\n  $selectedFilter: ContainerRegistryV2Filter\n  $limit: Int!\n  $skipSelected: Boolean!\n) {\n  adminContainerRegistriesV2(filter: $selectedFilter, limit: $limit) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        entityId\n        registryName\n        project\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9dea04576be2410d01afc4f5afdf519f";

export default node;
