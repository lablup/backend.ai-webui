/**
 * @generated SignedSource<<b822b0a5e00c9e7885b9c456d2f3fc97>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type RBACManagementPageActivateRoleMutation$variables = {
  id: string;
};
export type RBACManagementPageActivateRoleMutation$data = {
  readonly restoreRole: {
    readonly role: {
      readonly id: string;
      readonly status: RoleStatus;
    };
  };
};
export type RBACManagementPageActivateRoleMutation = {
  response: RBACManagementPageActivateRoleMutation$data;
  variables: RBACManagementPageActivateRoleMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "RestoreRolePayload",
    "kind": "LinkedField",
    "name": "restoreRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "role",
        "plural": false,
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
            "name": "status",
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
    "name": "RBACManagementPageActivateRoleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RBACManagementPageActivateRoleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8563612d276a3780ec05bf25d908f39e",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageActivateRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPageActivateRoleMutation(\n  $id: UUID!\n) {\n  restoreRole(id: $id) {\n    role {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa6c7a5ecd326f26b7aaa6dd38520b14";

export default node;
