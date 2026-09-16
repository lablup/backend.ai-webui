/**
 * @generated SignedSource<<102e915067eac35e374d32956cf9e41d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type CreatePermissionInput = {
  entityType: RBACElementType;
  operation: OperationType;
  roleId: string;
  scopeId: string;
  scopeType: RBACElementType;
};
export type LegacyCreatePermissionModalCreateMutation$variables = {
  input: CreatePermissionInput;
};
export type LegacyCreatePermissionModalCreateMutation$data = {
  readonly adminCreatePermission: {
    readonly entityType: RBACElementType;
    readonly id: string;
    readonly operation: OperationType;
    readonly scopeId: string;
    readonly scopeType: RBACElementType;
  } | null | undefined;
};
export type LegacyCreatePermissionModalCreateMutation = {
  response: LegacyCreatePermissionModalCreateMutation$data;
  variables: LegacyCreatePermissionModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Permission",
    "kind": "LinkedField",
    "name": "adminCreatePermission",
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
        "kind": "ScalarField",
        "name": "scopeType",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scopeId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityType",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "operation",
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
    "name": "LegacyCreatePermissionModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LegacyCreatePermissionModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f3b7bb656d11be581bae82bde9f72b71",
    "id": null,
    "metadata": {},
    "name": "LegacyCreatePermissionModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation LegacyCreatePermissionModalCreateMutation(\n  $input: CreatePermissionInput!\n) {\n  adminCreatePermission(input: $input) {\n    id\n    scopeType\n    scopeId\n    entityType\n    operation\n  }\n}\n"
  }
};
})();

(node as any).hash = "b2eb1bd50a7ae21e10856476f26719d8";

export default node;
