/**
 * @generated SignedSource<<d6785849e761f7a87cd9f8ab09faabe1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryType = "DOCKER" | "ECR" | "ECR_PUB" | "GITHUB" | "GITLAB" | "HARBOR" | "HARBOR2" | "LOCAL" | "OCP" | "%future added value";
export type ContainerRegistryV2OrderField = "IS_GLOBAL" | "REGISTRY_NAME" | "TYPE" | "URL" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
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
export type ContainerRegistryV2OrderBy = {
  direction?: OrderDirection;
  field?: ContainerRegistryV2OrderField;
};
export type ContainerRegistryListQuery$variables = {
  allowedProjectPreviewCount?: number | null | undefined;
  domain: string;
  filter?: ContainerRegistryV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ContainerRegistryV2OrderBy> | null | undefined;
};
export type ContainerRegistryListQuery$data = {
  readonly adminContainerRegistriesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly currentDomain: {
          readonly count: number;
        } | null | undefined;
        readonly entityId: string;
        readonly id: string;
        readonly isGlobal: boolean | null | undefined;
        readonly password: string | null | undefined;
        readonly project: string | null | undefined;
        readonly projects: {
          readonly count: number;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly basicInfo: {
                readonly name: string;
              };
              readonly id: string;
            };
          }>;
        } | null | undefined;
        readonly registryName: string;
        readonly type: ContainerRegistryType;
        readonly url: string;
        readonly username: string | null | undefined;
      };
    }>;
  } | null | undefined;
};
export type ContainerRegistryListQuery = {
  response: ContainerRegistryListQuery$data;
  variables: ContainerRegistryListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowedProjectPreviewCount"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domain"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
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
v8 = [
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
        "kind": "Variable",
        "name": "orderBy",
        "variableName": "orderBy"
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "type",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "project",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isGlobal",
                "storageKey": null
              },
              {
                "alias": "currentDomain",
                "args": [
                  {
                    "fields": [
                      {
                        "fields": [
                          {
                            "kind": "Variable",
                            "name": "equals",
                            "variableName": "domain"
                          }
                        ],
                        "kind": "ObjectValue",
                        "name": "name"
                      }
                    ],
                    "kind": "ObjectValue",
                    "name": "filter"
                  }
                ],
                "concreteType": "DomainV2Connection",
                "kind": "LinkedField",
                "name": "domains",
                "plural": false,
                "selections": [
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "first",
                    "variableName": "allowedProjectPreviewCount"
                  }
                ],
                "concreteType": "ProjectV2Connection",
                "kind": "LinkedField",
                "name": "projects",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2Edge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectBasicInfo",
                            "kind": "LinkedField",
                            "name": "basicInfo",
                            "plural": false,
                            "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryListQuery",
    "selections": (v8/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ContainerRegistryListQuery",
    "selections": (v8/*: any*/)
  },
  "params": {
    "cacheID": "648e6c019b0f1206308ed94db76375bf",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryListQuery(\n  $domain: String!\n  $filter: ContainerRegistryV2Filter\n  $orderBy: [ContainerRegistryV2OrderBy!]\n  $limit: Int\n  $offset: Int\n  $allowedProjectPreviewCount: Int\n) {\n  adminContainerRegistriesV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        registryName\n        url\n        type\n        project\n        username\n        password\n        isGlobal\n        currentDomain: domains(filter: {name: {equals: $domain}}) {\n          count\n        }\n        projects(first: $allowedProjectPreviewCount) {\n          count\n          edges {\n            node {\n              id\n              basicInfo {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d97d3b95023e6b0a1e64aaa2ac296440";

export default node;
