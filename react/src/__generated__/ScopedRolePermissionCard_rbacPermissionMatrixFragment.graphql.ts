/**
 * @generated SignedSource<<44c9e4023b513d367b2060d4c409fef3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ScopedRolePermissionCard_rbacPermissionMatrixFragment$data = ReadonlyArray<{
  readonly entities: ReadonlyArray<{
    readonly actions: ReadonlyArray<{
      readonly requiredPermission: OperationType;
    }>;
    readonly entityType: RBACElementType;
  }>;
  readonly scopeType: RBACElementType;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModal_rbacPermissionMatrixFragment">;
  readonly " $fragmentType": "ScopedRolePermissionCard_rbacPermissionMatrixFragment";
}>;
export type ScopedRolePermissionCard_rbacPermissionMatrixFragment$key = ReadonlyArray<{
  readonly " $data"?: ScopedRolePermissionCard_rbacPermissionMatrixFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCard_rbacPermissionMatrixFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ScopedRolePermissionCard_rbacPermissionMatrixFragment",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleScopePermissionEditModal_rbacPermissionMatrixFragment"
    }
  ],
  "type": "ScopeEntityOperationCombination",
  "abstractKey": null
};

(node as any).hash = "ee8d047dafbf283c89f24ec686552d48";

export default node;
