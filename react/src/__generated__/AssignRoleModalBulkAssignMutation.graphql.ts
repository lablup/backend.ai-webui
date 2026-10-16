/**
 * @generated SignedSource<<60d470b0181b2c753fe5a4c0f01fa60b>>
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
export type AssignRoleModalBulkAssignMutation$variables = {
  input: BulkAssignRoleInput;
};
export type AssignRoleModalBulkAssignMutation$data = {
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
export type AssignRoleModalBulkAssignMutation = {
  response: AssignRoleModalBulkAssignMutation$data;
  variables: AssignRoleModalBulkAssignMutation$variables;
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
    "name": "AssignRoleModalBulkAssignMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AssignRoleModalBulkAssignMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "545598ab56417816a46c5970a2504d59",
    "id": null,
    "metadata": {},
    "name": "AssignRoleModalBulkAssignMutation",
    "operationKind": "mutation",
    "text": "mutation AssignRoleModalBulkAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  adminBulkAssignRole(input: $input) {\n    assigned {\n      id\n      userId\n      grantedBy\n      grantedAt\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "551167c7c7372c61b97ff5db472badd4";

export default node;
