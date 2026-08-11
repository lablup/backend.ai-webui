/**
 * @generated SignedSource<<4da929242a5bad92a4039932dd7f0027>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeletePermissionInput = {
  id: string;
};
export type LegacyRolePermissionTabDeleteMutation$variables = {
  input: DeletePermissionInput;
};
export type LegacyRolePermissionTabDeleteMutation$data = {
  readonly adminDeletePermission: {
    readonly id: string;
  } | null | undefined;
};
export type LegacyRolePermissionTabDeleteMutation = {
  response: LegacyRolePermissionTabDeleteMutation$data;
  variables: LegacyRolePermissionTabDeleteMutation$variables;
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
    "concreteType": "DeletePermissionPayload",
    "kind": "LinkedField",
    "name": "adminDeletePermission",
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
    "name": "LegacyRolePermissionTabDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LegacyRolePermissionTabDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f749063a55917e8520bdd1282d2da545",
    "id": null,
    "metadata": {},
    "name": "LegacyRolePermissionTabDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation LegacyRolePermissionTabDeleteMutation(\n  $input: DeletePermissionInput!\n) {\n  adminDeletePermission(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a1335f8b7f7fd338288ce85b45b6a276";

export default node;
