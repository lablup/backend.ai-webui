/**
 * @generated SignedSource<<d6680eefaf2a38d6cf387952f8529b67>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "%future added value";
export type ProjectV2OrderField = "CREATED_AT" | "DOMAIN_NAME" | "IS_ACTIVE" | "MODIFIED_AT" | "NAME" | "TYPE" | "USER_EMAIL" | "USER_USERNAME" | "%future added value";
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type ProjectV2Filter = {
  AND?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  OR?: ReadonlyArray<ProjectV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  domain?: ProjectDomainNestedFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
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
export type ProjectV2OrderBy = {
  direction?: OrderDirection;
  field?: ProjectV2OrderField;
};
export type ProjectStoragePermissionTableQuery$variables = {
  domainName: string;
  filter?: ProjectV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ProjectV2OrderBy> | null | undefined;
  skip: boolean;
};
export type ProjectStoragePermissionTableQuery$data = {
  readonly domainProjectsV2?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
        readonly storage: {
          readonly allowedVfolderHosts: ReadonlyArray<{
            readonly host: string;
            readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
          }>;
        };
      };
    }>;
  } | null | undefined;
};
export type ProjectStoragePermissionTableQuery = {
  response: ProjectStoragePermissionTableQuery$data;
  variables: ProjectStoragePermissionTableQuery$variables;
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
  "name": "skip"
},
v6 = [
  {
    "condition": "skip",
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
          },
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
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "domainProjectsV2",
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectStorageInfo",
                    "kind": "LinkedField",
                    "name": "storage",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "VFolderHostPermissionEntry",
                        "kind": "LinkedField",
                        "name": "allowedVfolderHosts",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "host",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "permissions",
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
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectStoragePermissionTableQuery",
    "selections": (v6/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v5/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectStoragePermissionTableQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "0e24101ff25d660e5bdbc885ece17b0a",
    "id": null,
    "metadata": {},
    "name": "ProjectStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query ProjectStoragePermissionTableQuery(\n  $domainName: String!\n  $skip: Boolean!\n  $limit: Int\n  $offset: Int\n  $filter: ProjectV2Filter\n  $orderBy: [ProjectV2OrderBy!]\n) {\n  domainProjectsV2(scope: {domainName: $domainName}, limit: $limit, offset: $offset, filter: $filter, orderBy: $orderBy) @skip(if: $skip) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n        storage {\n          allowedVfolderHosts {\n            host\n            permissions\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "541670c1d64a58c9e84d269258ca2f8e";

export default node;
