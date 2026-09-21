/**
 * @generated SignedSource<<6d0eb3eead61cd3bed4dc18aa5a6ed44>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type BulkAddRolePermissionsInput = {
  permissions: ReadonlyArray<CreatePermissionInput>;
};
export type CreatePermissionInput = {
  entityType: string;
  operation?: OperationType | null | undefined;
  permission: PermissionBit;
  roleId: string;
  scopeId?: string | null | undefined;
  scopeType?: RBACElementType | null | undefined;
};
export type RoleScopePermissionEditModalBulkAddMutation$variables = {
  input: BulkAddRolePermissionsInput;
};
export type RoleScopePermissionEditModalBulkAddMutation$data = {
  readonly adminBulkAddRolePermissions: {
    readonly failed: ReadonlyArray<{
      readonly entityType: string;
      readonly message: string;
      readonly operation: string | null | undefined;
      readonly permission: PermissionBit;
      readonly scopeId: string | null | undefined;
    }>;
    readonly items: ReadonlyArray<{
      readonly entityType: string;
      readonly id: string;
      readonly operation: OperationType | null | undefined;
      readonly permission: PermissionBit;
      readonly scopeId: string | null | undefined;
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permission",
  "storageKey": null
},
v5 = [
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
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
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
          (v4/*: any*/),
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
    "selections": (v5/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleScopePermissionEditModalBulkAddMutation",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "5a0c9aa0c0ddaf70e57bb5779427d1c5",
    "id": null,
    "metadata": {},
    "name": "RoleScopePermissionEditModalBulkAddMutation",
    "operationKind": "mutation",
    "text": "mutation RoleScopePermissionEditModalBulkAddMutation(\n  $input: BulkAddRolePermissionsInput!\n) {\n  adminBulkAddRolePermissions(input: $input) {\n    items {\n      id\n      scopeId @deprecatedSince(version: \"26.9.0a1\")\n      entityType\n      operation @deprecatedSince(version: \"26.9.0a1\")\n      permission @since(version: \"26.9.0a1\")\n    }\n    failed {\n      scopeId @deprecatedSince(version: \"26.9.0a1\")\n      entityType\n      operation @deprecatedSince(version: \"26.9.0a1\")\n      permission @since(version: \"26.9.0a1\")\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "48b1cdeb6a4f56a32b7bc298170ef25f";

export default node;
