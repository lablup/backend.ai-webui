/**
 * @generated SignedSource<<f270b6f5d5fee50b46a5b6312eeb6a13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type LegacyCreatePermissionModalPermissionMatrixQuery$variables = Record<PropertyKey, never>;
export type LegacyCreatePermissionModalPermissionMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly entities: ReadonlyArray<{
      readonly actions: ReadonlyArray<{
        readonly requiredPermission: OperationType;
      }>;
      readonly entityType: RBACElementType;
    }>;
    readonly scopeType: RBACElementType;
  }> | null | undefined;
};
export type LegacyCreatePermissionModalPermissionMatrixQuery = {
  response: LegacyCreatePermissionModalPermissionMatrixQuery$data;
  variables: LegacyCreatePermissionModalPermissionMatrixQuery$variables;
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
            "kind": "ScalarField",
            "name": "entityType",
            "storageKey": null
          },
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
    "name": "LegacyCreatePermissionModalPermissionMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LegacyCreatePermissionModalPermissionMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d9148daa12705e7d1d6f02ddc18b58b5",
    "id": null,
    "metadata": {},
    "name": "LegacyCreatePermissionModalPermissionMatrixQuery",
    "operationKind": "query",
    "text": "query LegacyCreatePermissionModalPermissionMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      entityType\n      actions {\n        requiredPermission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca87dbfe37cc135310b416554845873e";

export default node;
