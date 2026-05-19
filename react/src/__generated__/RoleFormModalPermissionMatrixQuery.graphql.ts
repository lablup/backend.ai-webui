/**
 * @generated SignedSource<<ba8ffce63f7b3f4cc28c52e0703cae1f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RoleFormModalPermissionMatrixQuery$variables = Record<PropertyKey, never>;
export type RoleFormModalPermissionMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly entities: ReadonlyArray<{
      readonly actions: ReadonlyArray<{
        readonly requiredPermission: OperationType;
      }>;
    }>;
    readonly scopeType: RBACElementType;
  }> | null | undefined;
};
export type RoleFormModalPermissionMatrixQuery = {
  response: RoleFormModalPermissionMatrixQuery$data;
  variables: RoleFormModalPermissionMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ScopeEntityOperationCombination",
    "kind": "LinkedField",
    "name": "rbacPermissionMatrix",
    "plural": true,
    "selections": [
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
        "concreteType": "EntityActionInfo",
        "kind": "LinkedField",
        "name": "entities",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "OperationInfo",
            "kind": "LinkedField",
            "name": "actions",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "requiredPermission",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalPermissionMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RoleFormModalPermissionMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "25fd6c8406d027782c61ef4326c8af19",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalPermissionMatrixQuery",
    "operationKind": "query",
    "text": "query RoleFormModalPermissionMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      actions {\n        requiredPermission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee9601df7953401560bef1064288f384";

export default node;
