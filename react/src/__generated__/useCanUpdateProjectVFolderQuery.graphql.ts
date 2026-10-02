/**
 * @generated SignedSource<<58d8e2e8af9ab1eb2a234a98c7e4fe6b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type PermissionNestedFilter = {
  AND?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  OR?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  entityType?: RBACElementTypeFilter | null | undefined;
  operation?: OperationTypeFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
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
export type RBACElementTypeFilter = {
  equals?: RBACElementType | null | undefined;
  in?: ReadonlyArray<RBACElementType> | null | undefined;
  notEquals?: RBACElementType | null | undefined;
  notIn?: ReadonlyArray<RBACElementType> | null | undefined;
};
export type OperationTypeFilter = {
  equals?: OperationType | null | undefined;
  in?: ReadonlyArray<OperationType> | null | undefined;
  notEquals?: OperationType | null | undefined;
  notIn?: ReadonlyArray<OperationType> | null | undefined;
};
export type useCanUpdateProjectVFolderQuery$variables = {
  permissionFilter: PermissionNestedFilter;
  shouldQuery: boolean;
};
export type useCanUpdateProjectVFolderQuery$data = {
  readonly vfolderUpdateRoles?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type useCanUpdateProjectVFolderQuery = {
  response: useCanUpdateProjectVFolderQuery$data;
  variables: useCanUpdateProjectVFolderQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "permissionFilter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "shouldQuery"
  }
],
v1 = {
  "alias": "vfolderUpdateRoles",
  "args": [
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "permission",
          "variableName": "permissionFilter"
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
    {
      "kind": "Literal",
      "name": "first",
      "value": 1
    }
  ],
  "concreteType": "RoleAssignmentConnection",
  "kind": "LinkedField",
  "name": "myRoles",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useCanUpdateProjectVFolderQuery",
    "selections": [
      {
        "condition": "shouldQuery",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v1/*: any*/),
            "to": "RESULT"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useCanUpdateProjectVFolderQuery",
    "selections": [
      {
        "condition": "shouldQuery",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v1/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "12566d0f49b5de9aeec5a06666b5f374",
    "id": null,
    "metadata": {},
    "name": "useCanUpdateProjectVFolderQuery",
    "operationKind": "query",
    "text": "query useCanUpdateProjectVFolderQuery(\n  $permissionFilter: PermissionNestedFilter!\n  $shouldQuery: Boolean!\n) {\n  vfolderUpdateRoles: myRoles(first: 1, filter: {permission: $permissionFilter}) @include(if: $shouldQuery) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "57337483f6afb2ea2b293dd1441985d8";

export default node;
