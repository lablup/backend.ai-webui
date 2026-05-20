/**
 * @generated SignedSource<<050e8b42dd639bf4cd91092c3b9ef08b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type UpdatePermissionInput = {
  entityType?: RBACElementType | null | undefined;
  id: string;
  operation?: OperationType | null | undefined;
  scopeId?: string | null | undefined;
  scopeType?: RBACElementType | null | undefined;
};
export type CreatePermissionModalUpdateMutation$variables = {
  input: UpdatePermissionInput;
};
export type CreatePermissionModalUpdateMutation$data = {
  readonly adminUpdatePermission: {
    readonly entityType: RBACElementType;
    readonly id: string;
    readonly operation: OperationType;
    readonly scopeId: string;
    readonly scopeType: RBACElementType;
  } | null | undefined;
};
export type CreatePermissionModalUpdateMutation = {
  response: CreatePermissionModalUpdateMutation$data;
  variables: CreatePermissionModalUpdateMutation$variables;
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
    "name": "adminUpdatePermission",
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
    "name": "CreatePermissionModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreatePermissionModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9319b6dd164b99f995e8ba12df7d9f52",
    "id": null,
    "metadata": {},
    "name": "CreatePermissionModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation CreatePermissionModalUpdateMutation(\n  $input: UpdatePermissionInput!\n) {\n  adminUpdatePermission(input: $input) {\n    id\n    scopeType\n    scopeId\n    entityType\n    operation\n  }\n}\n"
  }
};
})();

(node as any).hash = "cec75607715b4700444c577b27f0e807";

export default node;
