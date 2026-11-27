/**
 * @generated SignedSource<<640818b8469cb36a598d3cbaa539f92e>>
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
export type RolePermissionSummaryTableGrantMutation$variables = {
  input: BulkAddRolePermissionsInput;
};
export type RolePermissionSummaryTableGrantMutation$data = {
  readonly partialBulkAddRolePermissions: {
    readonly failed: ReadonlyArray<{
      readonly entityType: string;
      readonly message: string;
      readonly permission: PermissionBit;
    }>;
    readonly items: ReadonlyArray<{
      readonly entityType: string;
      readonly id: string;
      readonly permission: PermissionBit;
    }>;
  };
};
export type RolePermissionSummaryTableGrantMutation = {
  response: RolePermissionSummaryTableGrantMutation$data;
  variables: RolePermissionSummaryTableGrantMutation$variables;
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
  "name": "entityType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permission",
  "storageKey": null
},
v3 = [
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
    "name": "partialBulkAddRolePermissions",
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
          (v2/*: any*/)
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
    "name": "RolePermissionSummaryTableGrantMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePermissionSummaryTableGrantMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "eab852e9d6b4cf64e53f881c95e333b9",
    "id": null,
    "metadata": {},
    "name": "RolePermissionSummaryTableGrantMutation",
    "operationKind": "mutation",
    "text": "mutation RolePermissionSummaryTableGrantMutation(\n  $input: BulkAddRolePermissionsInput!\n) {\n  partialBulkAddRolePermissions(input: $input) {\n    items {\n      id\n      entityType\n      permission\n    }\n    failed {\n      entityType\n      permission\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "22bed8ec78360d9be6870557ddb70ee5";

export default node;
