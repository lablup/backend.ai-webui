/**
 * @generated SignedSource<<0839e9c4cc7d679d3dd7db7b3d1bdfd0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteRoleInput = {
  id: string;
};
export type RBACManagementPageDeactivateRoleMutation$variables = {
  input: DeleteRoleInput;
};
export type RBACManagementPageDeactivateRoleMutation$data = {
  readonly adminDeleteRole: {
    readonly id: string;
  } | null | undefined;
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
    "concreteType": "DeleteRolePayload",
    "kind": "LinkedField",
    "name": "adminDeleteRole",
    "plural": false,
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
    "cacheID": "5ef51a672f57125f66f442c8c90276db",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageDeactivateRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPageDeactivateRoleMutation(\n  $input: DeleteRoleInput!\n) {\n  adminDeleteRole(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "80afe2309693a5fc29589ea7cb76826e";

export default node;
