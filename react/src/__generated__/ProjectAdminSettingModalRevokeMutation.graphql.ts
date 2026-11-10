/**
 * @generated SignedSource<<31bc2fbf033459fbf526b7bb5a05a311>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RevokeRoleInput = {
  roleId: string;
  userId: string;
};
export type ProjectAdminSettingModalRevokeMutation$variables = {
  input: RevokeRoleInput;
};
export type ProjectAdminSettingModalRevokeMutation$data = {
  readonly revokeRole: {
    readonly id: string;
  };
};
export type ProjectAdminSettingModalRevokeMutation = {
  response: ProjectAdminSettingModalRevokeMutation$data;
  variables: ProjectAdminSettingModalRevokeMutation$variables;
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
    "concreteType": "RoleAssignment",
    "kind": "LinkedField",
    "name": "revokeRole",
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
    "name": "ProjectAdminSettingModalRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectAdminSettingModalRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "cb283c47ea1d27079569926088ae539b",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSettingModalRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminSettingModalRevokeMutation(\n  $input: RevokeRoleInput!\n) {\n  revokeRole(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "652c9dd7b345204f4ef9a9ed244eeb55";

export default node;
