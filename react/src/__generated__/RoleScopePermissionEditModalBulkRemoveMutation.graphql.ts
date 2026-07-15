/**
 * @generated SignedSource<<f66fee1c5f644da15f9f6f06c4535f3d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkRemoveRolePermissionsInput = {
  permissionIds: ReadonlyArray<string>;
};
export type RoleScopePermissionEditModalBulkRemoveMutation$variables = {
  input: BulkRemoveRolePermissionsInput;
};
export type RoleScopePermissionEditModalBulkRemoveMutation$data = {
  readonly adminBulkRemoveRolePermissions: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly permissionId: string;
    }>;
    readonly items: ReadonlyArray<{
      readonly id: string;
    }>;
  } | null | undefined;
};
export type RoleScopePermissionEditModalBulkRemoveMutation = {
  response: RoleScopePermissionEditModalBulkRemoveMutation$data;
  variables: RoleScopePermissionEditModalBulkRemoveMutation$variables;
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
    "concreteType": "BulkRemoveRolePermissionsPayload",
    "kind": "LinkedField",
    "name": "adminBulkRemoveRolePermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Permission",
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
        "concreteType": "BulkRemoveRolePermissionFailureInfo",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permissionId",
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
    "name": "RoleScopePermissionEditModalBulkRemoveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleScopePermissionEditModalBulkRemoveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d8050c7e587fb8d8f30db1c5b4f85783",
    "id": null,
    "metadata": {},
    "name": "RoleScopePermissionEditModalBulkRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation RoleScopePermissionEditModalBulkRemoveMutation(\n  $input: BulkRemoveRolePermissionsInput!\n) {\n  adminBulkRemoveRolePermissions(input: $input) {\n    items {\n      id\n    }\n    failed {\n      permissionId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a831bca14fdd21705b1bdbb60d6709b8";

export default node;
