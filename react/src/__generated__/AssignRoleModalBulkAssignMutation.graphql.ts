/**
 * @generated SignedSource<<f0554b255b1420ac1a421c37454bd67f>>
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
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AssignRoleModalBulkAssignMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "cd0a9926aa25e9265864a81606927a8f",
    "id": null,
    "metadata": {},
    "name": "AssignRoleModalBulkAssignMutation",
    "operationKind": "mutation",
    "text": "mutation AssignRoleModalBulkAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  adminBulkAssignRole(input: $input) {\n    assigned {\n      id\n      userId\n      grantedBy\n      grantedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2600c468a1ac3c90f5f273212ae8b689";

export default node;
