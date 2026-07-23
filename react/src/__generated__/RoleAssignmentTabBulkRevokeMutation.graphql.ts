/**
 * @generated SignedSource<<b49ed5da4b0336b7219aae0606702038>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkRevokeRoleInput = {
  roleId: string;
  userIds: ReadonlyArray<string>;
};
export type RoleAssignmentTabBulkRevokeMutation$variables = {
  input: BulkRevokeRoleInput;
};
export type RoleAssignmentTabBulkRevokeMutation$data = {
  readonly adminBulkRevokeRole: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
    readonly revoked: ReadonlyArray<{
      readonly id: string;
    }>;
  } | null | undefined;
};
export type RoleAssignmentTabBulkRevokeMutation = {
  response: RoleAssignmentTabBulkRevokeMutation$data;
  variables: RoleAssignmentTabBulkRevokeMutation$variables;
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
    "concreteType": "BulkRevokeRolePayload",
    "kind": "LinkedField",
    "name": "adminBulkRevokeRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RoleAssignment",
        "kind": "LinkedField",
        "name": "revoked",
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
        "concreteType": "BulkRevokeRoleError",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "userId",
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
    "name": "RoleAssignmentTabBulkRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleAssignmentTabBulkRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4145760fac5406bb4414f43c50e49198",
    "id": null,
    "metadata": {},
    "name": "RoleAssignmentTabBulkRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation RoleAssignmentTabBulkRevokeMutation(\n  $input: BulkRevokeRoleInput!\n) {\n  adminBulkRevokeRole(input: $input) {\n    revoked {\n      id\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3763aa44ba7ad12e3d043f66eeafeac7";

export default node;
