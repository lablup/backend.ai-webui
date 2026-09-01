/**
 * @generated SignedSource<<5adad86985e5ec5dad7fc295fbd9879d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type UpdateRoleInput = {
  autoAssign?: boolean | null | undefined;
  description?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
  status?: RoleStatus | null | undefined;
};
export type RBACManagementPageActivateRoleMutation$variables = {
  input: UpdateRoleInput;
};
export type RBACManagementPageActivateRoleMutation$data = {
  readonly adminUpdateRole: {
    readonly id: string;
    readonly status: RoleStatus;
  } | null | undefined;
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
    "concreteType": "Role",
    "kind": "LinkedField",
    "name": "adminUpdateRole",
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
    "cacheID": "a54e3e63ac43e77daefa1453e8287d1c",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageActivateRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPageActivateRoleMutation(\n  $input: UpdateRoleInput!\n) {\n  adminUpdateRole(input: $input) {\n    id\n    status\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea8e1feab494efe8fcc47ba441d0f1e1";

export default node;
