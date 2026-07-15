/**
 * @generated SignedSource<<bd429ee1ebc4a117a75c7788931b6af1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type BulkAddRolePermissionsInput = {
  permissions: ReadonlyArray<CreatePermissionInput>;
};
export type CreatePermissionInput = {
  entityType: RBACElementType;
  operation: OperationType;
  roleId: string;
  scopeId: string;
  scopeType: RBACElementType;
};
export type RoleScopePermissionEditModalBulkAddMutation$variables = {
  input: BulkAddRolePermissionsInput;
};
export type RoleScopePermissionEditModalBulkAddMutation$data = {
  readonly adminBulkAddRolePermissions: {
    readonly failed: ReadonlyArray<{
      readonly entityType: string;
      readonly message: string;
      readonly operation: string;
      readonly scopeId: string;
    }>;
    readonly items: ReadonlyArray<{
      readonly entityType: RBACElementType;
      readonly id: string;
      readonly operation: OperationType;
      readonly scopeId: string;
      readonly scopeType: RBACElementType;
    }>;
  } | null | undefined;
};
export type RoleScopePermissionEditModalBulkAddMutation = {
  response: RoleScopePermissionEditModalBulkAddMutation$data;
  variables: RoleScopePermissionEditModalBulkAddMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityType",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "operation",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "BulkAddRolePermissionsPayload",
    "kind": "LinkedField",
    "name": "adminBulkAddRolePermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Permission",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
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
            "name": "scopeType",
            "storageKey": null
          },
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkAddRolePermissionFailureInfo",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "name": "RoleScopePermissionEditModalBulkAddMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleScopePermissionEditModalBulkAddMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "42260fc6c93be99534c8da6f57d445d5",
    "id": null,
    "metadata": {},
    "name": "RoleScopePermissionEditModalBulkAddMutation",
    "operationKind": "mutation",
    "text": "mutation RoleScopePermissionEditModalBulkAddMutation(\n  $input: BulkAddRolePermissionsInput!\n) {\n  adminBulkAddRolePermissions(input: $input) {\n    items {\n      id\n      scopeType\n      scopeId\n      entityType\n      operation\n    }\n    failed {\n      scopeId\n      entityType\n      operation\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "645cfe960d1d54f95e061f266d877ab2";

export default node;
