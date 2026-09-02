/**
 * @generated SignedSource<<67fbd487a1f68b631e0deef950ab233b>>
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
  readonly adminRevokeRole: {
    readonly id: string;
  } | null | undefined;
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
    "name": "adminRevokeRole",
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
    "cacheID": "2e131e9fdff9e117e2008ff193485547",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSettingModalRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminSettingModalRevokeMutation(\n  $input: RevokeRoleInput!\n) {\n  adminRevokeRole(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "4e35cbdc2a87f596043fd9daef274019";

export default node;
