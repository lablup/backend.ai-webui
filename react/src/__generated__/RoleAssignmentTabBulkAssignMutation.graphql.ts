/**
 * @generated SignedSource<<4166e0b48fd78db88ec176c9ca6016f3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkAssignRoleInput = {
  projectId?: string | null | undefined;
  roleId: string;
  userIds: ReadonlyArray<string>;
};
export type RoleAssignmentTabBulkAssignMutation$variables = {
  input: BulkAssignRoleInput;
};
export type RoleAssignmentTabBulkAssignMutation$data = {
  readonly adminBulkAssignRole: {
    readonly assigned: ReadonlyArray<{
      readonly grantedAt: string;
      readonly grantedBy: string | null | undefined;
      readonly id: string;
      readonly userId: string;
    }>;
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
  } | null | undefined;
};
export type RoleAssignmentTabBulkAssignMutation = {
  response: RoleAssignmentTabBulkAssignMutation$data;
  variables: RoleAssignmentTabBulkAssignMutation$variables;
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
  "name": "userId",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "BulkAssignRolePayload",
    "kind": "LinkedField",
    "name": "adminBulkAssignRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RoleAssignment",
        "kind": "LinkedField",
        "name": "assigned",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "grantedBy",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "grantedAt",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkAssignRoleError",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
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
    "name": "RoleAssignmentTabBulkAssignMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleAssignmentTabBulkAssignMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "d7d973c8a6ed32514fd821a9a8449550",
    "id": null,
    "metadata": {},
    "name": "RoleAssignmentTabBulkAssignMutation",
    "operationKind": "mutation",
    "text": "mutation RoleAssignmentTabBulkAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  adminBulkAssignRole(input: $input) {\n    assigned {\n      id\n      userId\n      grantedBy\n      grantedAt\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "399a2ff260a28c97a66e2e5a32d3e0e1";

export default node;
