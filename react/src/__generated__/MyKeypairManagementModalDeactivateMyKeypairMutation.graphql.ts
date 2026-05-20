/**
 * @generated SignedSource<<8da6286e62a423330ae819a90623e7d2>>
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isActive",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateMyKeypairPayload",
        "kind": "LinkedField",
        "name": "updateMyKeypair",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairGQL",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateMyKeypairPayload",
        "kind": "LinkedField",
        "name": "updateMyKeypair",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairGQL",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "496a879e5b407a736c6d75dc1b4f08ae",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalDeactivateMyKeypairMutation",
    "operationKind": "mutation",
    "text": "mutation MyKeypairManagementModalDeactivateMyKeypairMutation(\n  $input: UpdateMyKeypairInput!\n) {\n  updateMyKeypair(input: $input) {\n    keypair {\n      isActive\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "54d9e1b4ca9e35416b89e78f9737b8c7";

export default node;
