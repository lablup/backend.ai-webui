/**
 * @generated SignedSource<<f8da423baca99f6cae64a155553ba7e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type UserV2OrderField = "CONTAINER_MAIN_GID" | "CONTAINER_UID" | "CREATED_AT" | "DESCRIPTION" | "DOMAIN_ID" | "DOMAIN_NAME" | "EMAIL" | "ENTITY_ID" | "FULL_NAME" | "INTEGRATION_NAME" | "MODIFIED_AT" | "NEED_PASSWORD_CHANGE" | "PROJECT_NAME" | "RESOURCE_POLICY" | "ROLE" | "STATUS" | "STATUS_INFO" | "SUDO_SESSION_ENABLED" | "TOTP_ACTIVATED" | "TOTP_ACTIVATED_AT" | "USERNAME" | "%future added value";
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
export type UserV2OrderBy = {
  direction?: OrderDirection;
  field?: UserV2OrderField;
};
export type BAIUserSelectPaginatedQuery$variables = {
  domainName: string;
  filter?: UserV2Filter | null | undefined;
  limit: number;
  offset: number;
  orderBy?: ReadonlyArray<UserV2OrderBy> | null | undefined;
  projectId: string;
  useAdmin: boolean;
  useDomain: boolean;
  useProject: boolean;
};
export type BAIUserSelectPaginatedQuery$data = {
  readonly adminUsersV2?: {
    readonly count: number;
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
    readonly count: number;
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
    readonly count: number;
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
};
export type BAIUserSelectPaginatedQuery = {
  response: BAIUserSelectPaginatedQuery$data;
  variables: BAIUserSelectPaginatedQuery$variables;
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
  "name": "filter"
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
  "name": "orderBy"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useAdmin"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useDomain"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useProject"
},
v9 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v10 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v11 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v12 = {
  "kind": "Variable",
  "name": "orderBy",
  "variableName": "orderBy"
},
v13 = [
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
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "email",
                "storageKey": null
              },
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
          (v10/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/)
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
          (v11/*: any*/),
          (v12/*: any*/),
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
          (v11/*: any*/),
          (v12/*: any*/),
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
    "name": "BAIUserSelectPaginatedQuery",
    "selections": (v14/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIUserSelectPaginatedQuery",
    "selections": (v14/*: any*/)
  },
  "params": {
    "cacheID": "b55cfe106012b73591f9bb622f5d9ff6",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: UserV2Filter\n  $orderBy: [UserV2OrderBy!]\n  $domainName: String!\n  $projectId: UUID!\n  $useAdmin: Boolean!\n  $useDomain: Boolean!\n  $useProject: Boolean!\n) {\n  adminUsersV2(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useAdmin) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n  domainUsersV2(scope: {domainName: $domainName}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useDomain) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n  projectUsersV2(scope: {projectId: $projectId}, offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) @include(if: $useProject) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "774c356d5c02b46e6dcd3b1c92287d87";

export default node;
