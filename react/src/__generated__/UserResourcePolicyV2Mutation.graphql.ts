/**
 * @generated SignedSource<<55192abc177db8ed046fad148b0f9868>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicyV2Mutation$variables = {
  name: string;
};
export type UserResourcePolicyV2Mutation$data = {
  readonly adminDeleteUserResourcePolicyV2: {
    readonly name: string;
  } | null | undefined;
};
export type UserResourcePolicyV2Mutation = {
  response: UserResourcePolicyV2Mutation$data;
  variables: UserResourcePolicyV2Mutation$variables;
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
    "concreteType": "DeleteUserResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminDeleteUserResourcePolicyV2",
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
    "name": "UserResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fbf8580d648b402792efee8f1dbda4d5",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyV2Mutation(\n  $name: String!\n) {\n  adminDeleteUserResourcePolicyV2(name: $name) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "12aba1bd23b572a97f9312abc5d145d1";

export default node;
