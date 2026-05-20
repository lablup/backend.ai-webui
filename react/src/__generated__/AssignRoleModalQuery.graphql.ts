/**
 * @generated SignedSource<<ee42ed16b22be0ea3c0e9ab108f59c57>>
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
  createdAt?: DateTimeFilter | null | undefined;
  domain?: UserDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  email?: StringFilter | null | undefined;
  integrationName?: StringFilter | null | undefined;
  project?: UserProjectNestedFilter | null | undefined;
  role?: UserRoleV2EnumFilter | null | undefined;
  status?: UserStatusV2EnumFilter | null | undefined;
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
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type UserDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type UserProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type AssignRoleModalQuery$variables = {
  filter?: UserV2Filter | null | undefined;
  first?: number | null | undefined;
};
export type AssignRoleModalQuery$data = {
  readonly adminUsersV2: {
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
export type AssignRoleModalQuery = {
  response: AssignRoleModalQuery$data;
  variables: AssignRoleModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  }
],
v1 = [
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
        "variableName": "first"
      }
    ],
    "concreteType": "UserV2Connection",
    "kind": "LinkedField",
    "name": "adminUsersV2",
    "plural": false,
    "selections": [
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AssignRoleModalQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AssignRoleModalQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "87008b0d957fc6b96793937dcc1543b3",
    "id": null,
    "metadata": {},
    "name": "AssignRoleModalQuery",
    "operationKind": "query",
    "text": "query AssignRoleModalQuery(\n  $filter: UserV2Filter\n  $first: Int\n) {\n  adminUsersV2(filter: $filter, first: $first) {\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "be25e30a73e4c0954c229336007f6985";

export default node;
