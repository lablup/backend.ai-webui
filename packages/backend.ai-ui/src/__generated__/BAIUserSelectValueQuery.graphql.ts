/**
 * @generated SignedSource<<8ed5b0b3d06760465bda6bc9662c2b17>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type UserV2Filter = {
  AND?: ReadonlyArray<UserV2Filter> | null | undefined;
  NOT?: ReadonlyArray<UserV2Filter> | null | undefined;
  OR?: ReadonlyArray<UserV2Filter> | null | undefined;
  containerGids?: IntArrayFilter | null | undefined;
  containerMainGid?: IntFilter | null | undefined;
  containerUid?: IntFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  description?: StringFilter | null | undefined;
  domain?: UserDomainNestedFilter | null | undefined;
  domainId?: UUIDFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  email?: StringFilter | null | undefined;
  fullName?: StringFilter | null | undefined;
  integrationName?: StringFilter | null | undefined;
  keypairs?: UserKeypairNestedFilter | null | undefined;
  modifiedAt?: DateTimeFilter | null | undefined;
  needPasswordChange?: boolean | null | undefined;
  project?: UserProjectNestedFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  role?: UserRoleV2EnumFilter | null | undefined;
  status?: UserStatusV2EnumFilter | null | undefined;
  statusInfo?: StringFilter | null | undefined;
  sudoSessionEnabled?: boolean | null | undefined;
  totpActivated?: boolean | null | undefined;
  totpActivatedAt?: NullableDateTimeFilter | null | undefined;
  username?: StringFilter | null | undefined;
  uuid?: UUIDFilter | null | undefined;
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
export type UserStatusV2EnumFilter = {
  equals?: UserStatusV2 | null | undefined;
  in?: ReadonlyArray<UserStatusV2> | null | undefined;
  notEquals?: UserStatusV2 | null | undefined;
  notIn?: ReadonlyArray<UserStatusV2> | null | undefined;
};
export type UserRoleV2EnumFilter = {
  equals?: UserRoleV2 | null | undefined;
  in?: ReadonlyArray<UserRoleV2> | null | undefined;
  notEquals?: UserRoleV2 | null | undefined;
  notIn?: ReadonlyArray<UserRoleV2> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type IntArrayFilter = {
  contains?: number | null | undefined;
  containsAll?: ReadonlyArray<number> | null | undefined;
  containsAny?: ReadonlyArray<number> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type NullableDateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  isNull?: boolean | null | undefined;
  notEquals?: string | null | undefined;
};
export type UserKeypairNestedFilter = {
  every?: KeypairFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: KeypairFilter | null | undefined;
  some?: KeypairFilter | null | undefined;
};
export type KeypairFilter = {
  AND?: ReadonlyArray<KeypairFilter> | null | undefined;
  NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
  OR?: ReadonlyArray<KeypairFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  isDefault?: boolean | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  userId?: UUIDFilter | null | undefined;
};
export type UserDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type UserProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type BAIUserSelectValueQuery$variables = {
  domainName: string;
  legacySelectedFilter?: string | null | undefined;
  limit: number;
  projectId: string;
  selectedFilter?: UserV2Filter | null | undefined;
  useAdmin: boolean;
  useDomain: boolean;
  useLegacy: boolean;
  useProject: boolean;
};
export type BAIUserSelectValueQuery$data = {
  readonly adminUsersV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
          readonly fullName: string | null | undefined;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
  readonly domainUsersV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
          readonly fullName: string | null | undefined;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
  readonly projectUsersV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
          readonly fullName: string | null | undefined;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
  readonly user_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly email: string | null | undefined;
        readonly full_name: string | null | undefined;
        readonly id: string;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIUserSelectValueQuery = {
  response: BAIUserSelectValueQuery$data;
  variables: BAIUserSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "legacySelectedFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useAdmin"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useDomain"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useLegacy"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useProject"
},
v9 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "selectedFilter"
},
v10 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v13 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "UserV2Edge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v11/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              (v12/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "fullName",
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
v14 = [
  {
    "condition": "useAdmin",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          (v9/*: any*/),
          (v10/*: any*/)
        ],
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "adminUsersV2",
        "plural": false,
        "selections": (v13/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "useDomain",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "domainName",
                "variableName": "domainName"
              }
            ],
            "kind": "ObjectValue",
            "name": "scope"
          }
        ],
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "domainUsersV2",
        "plural": false,
        "selections": (v13/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "useProject",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "projectId",
                "variableName": "projectId"
              }
            ],
            "kind": "ObjectValue",
            "name": "scope"
          }
        ],
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "projectUsersV2",
        "plural": false,
        "selections": (v13/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "useLegacy",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "legacySelectedFilter"
          },
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "limit"
          }
        ],
        "concreteType": "UserConnection",
        "kind": "LinkedField",
        "name": "user_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "full_name",
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
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIUserSelectValueQuery",
    "selections": (v14/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v8/*: any*/),
      (v1/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIUserSelectValueQuery",
    "selections": (v14/*: any*/)
  },
  "params": {
    "cacheID": "e7fca0174d0f1a00145ecfccc68f9305",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectValueQuery(\n  $selectedFilter: UserV2Filter\n  $limit: Int!\n  $domainName: String!\n  $projectId: UUID!\n  $useAdmin: Boolean!\n  $useDomain: Boolean!\n  $useProject: Boolean!\n  $legacySelectedFilter: String\n  $useLegacy: Boolean!\n) {\n  adminUsersV2(filter: $selectedFilter, limit: $limit) @include(if: $useAdmin) @since(version: \"26.2.0\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n  domainUsersV2(scope: {domainName: $domainName}, filter: $selectedFilter, limit: $limit) @include(if: $useDomain) @since(version: \"26.2.0\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n  projectUsersV2(scope: {projectId: $projectId}, filter: $selectedFilter, limit: $limit) @include(if: $useProject) @since(version: \"26.2.0\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n  user_nodes(filter: $legacySelectedFilter, first: $limit) @include(if: $useLegacy) @deprecatedSince(version: \"26.2.0\") {\n    edges {\n      node {\n        id\n        email\n        full_name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "46357e6017da80524eded690f1602bd7";

export default node;
