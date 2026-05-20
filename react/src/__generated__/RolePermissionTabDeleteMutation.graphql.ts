/**
 * @generated SignedSource<<e4dd52e56ca2060d95985b30d4e0e117>>
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
export type RolePermissionTabDeleteMutation$variables = {
  input: DeletePermissionInput;
};
export type RolePermissionTabDeleteMutation$data = {
  readonly adminDeletePermission: {
    readonly id: string;
  } | null | undefined;
};
export type RolePermissionTabDeleteMutation = {
  response: RolePermissionTabDeleteMutation$data;
  variables: RolePermissionTabDeleteMutation$variables;
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
    "name": "RolePermissionTabDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePermissionTabDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "21bcc3ef440b8ee1892f5e43bccba350",
    "id": null,
    "metadata": {},
    "name": "RolePermissionTabDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation RolePermissionTabDeleteMutation(\n  $input: DeletePermissionInput!\n) {\n  adminDeletePermission(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5080c1c8f64f594e29adcaae3a26b306";

export default node;
