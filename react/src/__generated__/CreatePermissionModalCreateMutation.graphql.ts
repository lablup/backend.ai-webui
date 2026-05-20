/**
 * @generated SignedSource<<90241fc455072b4b1db04895eeb93ad5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type CreatePermissionInput = {
  entityType: RBACElementType;
  operation: OperationType;
  roleId: string;
  scopeId: string;
  scopeType: RBACElementType;
};
export type CreatePermissionModalCreateMutation$variables = {
  input: CreatePermissionInput;
};
export type CreatePermissionModalCreateMutation$data = {
  readonly adminCreatePermission: {
    readonly entityType: RBACElementType;
    readonly id: string;
    readonly operation: OperationType;
    readonly scopeId: string;
    readonly scopeType: RBACElementType;
  } | null | undefined;
};
export type CreatePermissionModalCreateMutation = {
  response: CreatePermissionModalCreateMutation$data;
  variables: CreatePermissionModalCreateMutation$variables;
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
    "name": "CreatePermissionModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreatePermissionModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "28070824e786537f6effa1e5a191c528",
    "id": null,
    "metadata": {},
    "name": "CreatePermissionModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation CreatePermissionModalCreateMutation(\n  $input: CreatePermissionInput!\n) {\n  adminCreatePermission(input: $input) {\n    id\n    scopeType\n    scopeId\n    entityType\n    operation\n  }\n}\n"
  }
};
})();

(node as any).hash = "fed4399db7041cb2b6fbc5c2e63ca22c";

export default node;
