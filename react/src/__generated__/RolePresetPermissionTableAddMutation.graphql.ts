/**
 * @generated SignedSource<<c5cd65b8e229945d289626b0784a91ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type BulkAddRolePermissionPresetsInput = {
  permissions: ReadonlyArray<RolePermissionPresetEntryInput>;
  rolePresetId: string;
};
export type RolePermissionPresetEntryInput = {
  entityType: string;
  operation?: OperationType | null | undefined;
  permission: PermissionBit;
};
export type RolePresetPermissionTableAddMutation$variables = {
  input: BulkAddRolePermissionPresetsInput;
};
export type RolePresetPermissionTableAddMutation$data = {
  readonly adminBulkAddRolePresetPermissions: {
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
  } | null | undefined;
};
export type RolePresetPermissionTableAddMutation = {
  response: RolePresetPermissionTableAddMutation$data;
  variables: RolePresetPermissionTableAddMutation$variables;
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
    "concreteType": "BulkAddRolePermissionPresetsPayload",
    "kind": "LinkedField",
    "name": "adminBulkAddRolePresetPermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RolePermissionPreset",
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
        "concreteType": "BulkAddRolePermissionPresetFailureInfo",
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
    "name": "RolePresetPermissionTableAddMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePresetPermissionTableAddMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "75e974b7faa2fb568ac96d5bfb7a19a0",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableAddMutation",
    "operationKind": "mutation",
    "text": "mutation RolePresetPermissionTableAddMutation(\n  $input: BulkAddRolePermissionPresetsInput!\n) {\n  adminBulkAddRolePresetPermissions(input: $input) {\n    items {\n      id\n      entityType\n      permission\n    }\n    failed {\n      entityType\n      permission\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b94edf4710bf841855abca2e643488c9";

export default node;
