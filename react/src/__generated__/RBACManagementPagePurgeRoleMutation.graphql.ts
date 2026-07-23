/**
 * @generated SignedSource<<26a986b5b363661be1d1f33e5ece14d4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PurgeRoleInput = {
  id: string;
};
export type RBACManagementPagePurgeRoleMutation$variables = {
  input: PurgeRoleInput;
};
export type RBACManagementPagePurgeRoleMutation$data = {
  readonly adminPurgeRole: {
    readonly id: string;
  } | null | undefined;
};
export type RBACManagementPagePurgeRoleMutation = {
  response: RBACManagementPagePurgeRoleMutation$data;
  variables: RBACManagementPagePurgeRoleMutation$variables;
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
    "concreteType": "PurgeRolePayload",
    "kind": "LinkedField",
    "name": "adminPurgeRole",
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
    "name": "RBACManagementPagePurgeRoleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RBACManagementPagePurgeRoleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "93ad1f3d0813191d97a9195d29feeac3",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPagePurgeRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPagePurgeRoleMutation(\n  $input: PurgeRoleInput!\n) {\n  adminPurgeRole(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "fa9ba2bdd510368b17354afbb8fb319d";

export default node;
