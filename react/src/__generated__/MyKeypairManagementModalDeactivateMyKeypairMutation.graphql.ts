/**
 * @generated SignedSource<<ec523565cf1054a70d213b03992965e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateMyKeypairInput = {
  accessKey: string;
  isActive: boolean;
};
export type MyKeypairManagementModalDeactivateMyKeypairMutation$variables = {
  input: UpdateMyKeypairInput;
};
export type MyKeypairManagementModalDeactivateMyKeypairMutation$data = {
  readonly updateMyKeypair: {
    readonly keypair: {
      readonly id: string;
      readonly isActive: boolean | null | undefined;
    };
  } | null | undefined;
};
export type MyKeypairManagementModalDeactivateMyKeypairMutation = {
  response: MyKeypairManagementModalDeactivateMyKeypairMutation$data;
  variables: MyKeypairManagementModalDeactivateMyKeypairMutation$variables;
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
    "concreteType": "UpdateMyKeypairPayload",
    "kind": "LinkedField",
    "name": "updateMyKeypair",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairV2",
        "kind": "LinkedField",
        "name": "keypair",
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
            "name": "isActive",
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
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9ee08b66ba5e8114c4df23e5798a1249",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "operationKind": "mutation",
    "text": "mutation MyKeypairManagementModalDeactivateMyKeypairMutation(\n  $input: UpdateMyKeypairInput!\n) {\n  updateMyKeypair(input: $input) {\n    keypair {\n      id\n      isActive\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e61cf4515d8cb590a8a1af0b87f91045";

export default node;
