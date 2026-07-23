/**
 * @generated SignedSource<<d792c7e6f77cc6645c8746d72ea80369>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RolePermissionDetailTabMatrixQuery$variables = Record<PropertyKey, never>;
export type RolePermissionDetailTabMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly scopeType: RBACElementType;
    readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCard_rbacPermissionMatrixFragment">;
  }> | null | undefined;
};
export type RolePermissionDetailTabMatrixQuery = {
  response: RolePermissionDetailTabMatrixQuery$data;
  variables: RolePermissionDetailTabMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityOperationCombination",
        "kind": "LinkedField",
        "name": "rbacPermissionMatrix",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ScopedRolePermissionCard_rbacPermissionMatrixFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityOperationCombination",
        "kind": "LinkedField",
        "name": "rbacPermissionMatrix",
        "plural": true,
        "selections": [
          (v0/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "0010d510e43785caba131492bc44e146",
    "id": null,
    "metadata": {},
    "name": "RolePermissionDetailTabMatrixQuery",
    "operationKind": "query",
    "text": "query RolePermissionDetailTabMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    ...ScopedRolePermissionCard_rbacPermissionMatrixFragment\n  }\n}\n\nfragment RoleScopePermissionEditModal_rbacPermissionMatrixFragment on ScopeEntityOperationCombination {\n  scopeType\n  entities {\n    entityType\n    actions {\n      requiredPermission\n    }\n  }\n}\n\nfragment ScopedRolePermissionCard_rbacPermissionMatrixFragment on ScopeEntityOperationCombination {\n  scopeType\n  entities {\n    entityType\n    actions {\n      requiredPermission\n    }\n  }\n  ...RoleScopePermissionEditModal_rbacPermissionMatrixFragment\n}\n"
  }
};
})();

(node as any).hash = "7bc8b4ed1a4b4c7addb69fb3602fa43a";

export default node;
