/**
 * @generated SignedSource<<fa49f46e953299826be69ba4c28da01d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RolePermissionDetailTabMatrixQuery$variables = Record<PropertyKey, never>;
export type RolePermissionDetailTabMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly entities: ReadonlyArray<{
      readonly actions: ReadonlyArray<{
        readonly description: string;
        readonly operation: string;
        readonly requiredPermission: OperationType;
      }>;
      readonly entityType: RBACElementType;
    }>;
    readonly scopeType: RBACElementType;
  }> | null | undefined;
};
export type RolePermissionDetailTabMatrixQuery = {
  response: RolePermissionDetailTabMatrixQuery$data;
  variables: RolePermissionDetailTabMatrixQuery$variables;
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
                "name": "operation",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
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
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "c33c2ba782ac62d12661a4aaf098d1d3",
    "id": null,
    "metadata": {},
    "name": "RolePermissionDetailTabMatrixQuery",
    "operationKind": "query",
    "text": "query RolePermissionDetailTabMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      entityType\n      actions {\n        operation\n        description\n        requiredPermission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d31ffa4e95175f8bf1c3039329e1856";

export default node;
