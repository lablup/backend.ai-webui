/**
 * @generated SignedSource<<187cb738608a245ba0bd732b4f89aa79>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RevokeMyKeypairInput = {
  accessKey: string;
};
export type MyKeypairManagementModalRevokeMyKeypairMutation$variables = {
  input: RevokeMyKeypairInput;
};
export type MyKeypairManagementModalRevokeMyKeypairMutation$data = {
  readonly revokeMyKeypair: {
    readonly success: boolean;
  } | null | undefined;
};
export type MyKeypairManagementModalRevokeMyKeypairMutation = {
  response: MyKeypairManagementModalRevokeMyKeypairMutation$data;
  variables: MyKeypairManagementModalRevokeMyKeypairMutation$variables;
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
    "concreteType": "RevokeMyKeypairPayload",
    "kind": "LinkedField",
    "name": "revokeMyKeypair",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "MyKeypairManagementModalRevokeMyKeypairMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyKeypairManagementModalRevokeMyKeypairMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7a3062edcab42e9cb2dcf5fcc61ece5b",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalRevokeMyKeypairMutation",
    "operationKind": "mutation",
    "text": "mutation MyKeypairManagementModalRevokeMyKeypairMutation(\n  $input: RevokeMyKeypairInput!\n) {\n  revokeMyKeypair(input: $input) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "7f878b3c416c5a5eef21c5fd02f5c504";

export default node;
