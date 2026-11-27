/**
 * @generated SignedSource<<24555f7f1e17808510ce297cf2f64abe>>
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
  readonly atomicBulkAddRolePresetPermissions: {
    readonly items: ReadonlyArray<{
      readonly id: string;
    }>;
  };
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
    "concreteType": "AtomicBulkAddRolePresetPermissionsPayload",
    "kind": "LinkedField",
    "name": "atomicBulkAddRolePresetPermissions",
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
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePresetPermissionTableAddMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "df20af7bc0e023ee9484001152772c11",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableAddMutation",
    "operationKind": "mutation",
    "text": "mutation RolePresetPermissionTableAddMutation(\n  $input: BulkAddRolePermissionPresetsInput!\n) {\n  atomicBulkAddRolePresetPermissions(input: $input) {\n    items {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b54158188c916d2479f3dbe2bd76a855";

export default node;
