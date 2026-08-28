/**
 * @generated SignedSource<<e9c7b98db4859c9c5a1af8911ae01031>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyV2Mutation$variables = {
  name: string;
};
export type KeypairResourcePolicyV2Mutation$data = {
  readonly adminDeleteKeypairResourcePolicyV2: {
    readonly name: string;
  } | null | undefined;
};
export type KeypairResourcePolicyV2Mutation = {
  response: KeypairResourcePolicyV2Mutation$data;
  variables: KeypairResourcePolicyV2Mutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "DeleteKeypairResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminDeleteKeypairResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
    "name": "KeypairResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a79907aee60010ce5a10601c91e6c56f",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyV2Mutation(\n  $name: String!\n) {\n  adminDeleteKeypairResourcePolicyV2(name: $name) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "b69cd12bcfdddcd9e5439c3d1c53b4af";

export default node;
