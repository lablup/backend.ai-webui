/**
 * @generated SignedSource<<19881b61a8df70f4d43fdf3a8cdb70e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type RBACManagementPageDeactivateRoleMutation$variables = {
  id: string;
};
export type RBACManagementPageDeactivateRoleMutation$data = {
  readonly deleteRole: {
    readonly role: {
      readonly id: string;
      readonly status: RoleStatus;
    };
  };
};
export type RBACManagementPageDeactivateRoleMutation = {
  response: RBACManagementPageDeactivateRoleMutation$data;
  variables: RBACManagementPageDeactivateRoleMutation$variables;
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
    "concreteType": "DeleteRolePayload",
    "kind": "LinkedField",
    "name": "deleteRole",
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
    "name": "RBACManagementPageDeactivateRoleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RBACManagementPageDeactivateRoleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "184839538311bd5547d7fa564a64d351",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageDeactivateRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPageDeactivateRoleMutation(\n  $id: UUID!\n) {\n  deleteRole(id: $id) {\n    role {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dd649cd15662a361893cbbc0aa025109";

export default node;
