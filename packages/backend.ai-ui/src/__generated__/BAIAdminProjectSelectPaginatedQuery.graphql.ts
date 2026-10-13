/**
 * @generated SignedSource<<e4af9c30368fae262ede5e201f97e511>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type ProjectV2Filter = {
  AND?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  OR?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  description?: StringFilter | null | undefined;
  domain?: ProjectDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  integrationName?: StringFilter | null | undefined;
  isActive?: boolean | null | undefined;
  modifiedAt?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  type?: ProjectTypeV2EnumFilter | null | undefined;
  user?: ProjectUserNestedFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
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
export type ProjectTypeV2EnumFilter = {
  equals?: ProjectTypeV2 | null | undefined;
  in_?: ReadonlyArray<ProjectTypeV2> | null | undefined;
  notEquals?: ProjectTypeV2 | null | undefined;
  notIn?: ReadonlyArray<ProjectTypeV2> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type ProjectDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type ProjectUserNestedFilter = {
  email?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isActive?: boolean | null | undefined;
  username?: StringFilter | null | undefined;
};
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type BAIAdminProjectSelectPaginatedQuery$variables = {
  filter?: ProjectV2Filter | null | undefined;
  limit: number;
  offset: number;
  scope: ProjectScope;
  useScope: boolean;
};
export type BAIAdminProjectSelectPaginatedQuery$data = {
  readonly adminProjectsV2?: {
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
  readonly scopedProjectsV2?: {
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
};
export type BAIAdminProjectSelectPaginatedQuery = {
  response: BAIAdminProjectSelectPaginatedQuery$data;
  variables: BAIAdminProjectSelectPaginatedQuery$variables;
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
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useScope"
},
v5 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v6 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v7 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v8 = {
  "kind": "Literal",
  "name": "orderBy",
  "value": [
    {
      "direction": "ASC",
      "field": "NAME"
    }
  ]
},
v9 = [
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
v10 = [
  {
    "condition": "useScope",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "scope",
            "variableName": "scope"
          }
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "scopedProjectsV2",
        "plural": false,
        "selections": (v9/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "useScope",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/)
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "adminProjectsV2",
        "plural": false,
        "selections": (v9/*: any*/),
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
    "name": "BAIAdminProjectSelectPaginatedQuery",
    "selections": (v10/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminProjectSelectPaginatedQuery",
    "selections": (v10/*: any*/)
  },
  "params": {
    "cacheID": "61197ab429dc21569d016ae2bcff67bf",
    "id": null,
    "metadata": {},
    "name": "BAIAdminProjectSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminProjectSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: ProjectV2Filter\n  $scope: ProjectScope!\n  $useScope: Boolean!\n) {\n  scopedProjectsV2(scope: $scope, offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) @include(if: $useScope) @since(version: \"26.9.0a4\") {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  adminProjectsV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) @skip(if: $useScope) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a56a660262ba3fe91730c3a6e375a233";

export default node;
