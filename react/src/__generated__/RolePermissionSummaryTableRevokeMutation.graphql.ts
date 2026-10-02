/**
 * @generated SignedSource<<ea3f6b4cd1559228bae4f4c53176d34e>>
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
export type RolePermissionSummaryTableRevokeMutation$variables = {
  input: BulkRemoveRolePermissionsInput;
};
export type RolePermissionSummaryTableRevokeMutation$data = {
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
export type RolePermissionSummaryTableRevokeMutation = {
  response: RolePermissionSummaryTableRevokeMutation$data;
  variables: RolePermissionSummaryTableRevokeMutation$variables;
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
    "name": "RolePermissionSummaryTableRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePermissionSummaryTableRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9279502b941bd0ecd241258118a3cacf",
    "id": null,
    "metadata": {},
    "name": "RolePermissionSummaryTableRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation RolePermissionSummaryTableRevokeMutation(\n  $input: BulkRemoveRolePermissionsInput!\n) {\n  adminBulkRemoveRolePermissions(input: $input) {\n    items {\n      id\n    }\n    failed {\n      permissionId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "601c90466c602e3f3e4cbfc8ce8c1322";

export default node;
