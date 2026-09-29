/**
 * @generated SignedSource<<afbb3498835da227319bbc2927140459>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkRemoveRolePermissionPresetsInput = {
  permissionPresetIds: ReadonlyArray<string>;
};
export type RolePresetPermissionTableRemoveMutation$variables = {
  input: BulkRemoveRolePermissionPresetsInput;
};
export type RolePresetPermissionTableRemoveMutation$data = {
  readonly adminBulkRemoveRolePresetPermissions: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly permissionPresetId: string;
    }>;
    readonly items: ReadonlyArray<{
      readonly id: string;
    }>;
  } | null | undefined;
};
export type RolePresetPermissionTableRemoveMutation = {
  response: RolePresetPermissionTableRemoveMutation$data;
  variables: RolePresetPermissionTableRemoveMutation$variables;
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
    "concreteType": "BulkRemoveRolePermissionPresetsPayload",
    "kind": "LinkedField",
    "name": "adminBulkRemoveRolePresetPermissions",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkRolePermissionPresetFailureInfo",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permissionPresetId",
            "storageKey": null
          },
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
    "name": "RolePresetPermissionTableRemoveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePresetPermissionTableRemoveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3e3163dcdbfb1073f6450d144773d8f0",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation RolePresetPermissionTableRemoveMutation(\n  $input: BulkRemoveRolePermissionPresetsInput!\n) {\n  adminBulkRemoveRolePresetPermissions(input: $input) {\n    items {\n      id\n    }\n    failed {\n      permissionPresetId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7926069880c7481b9bf3e42087ef4740";

export default node;
