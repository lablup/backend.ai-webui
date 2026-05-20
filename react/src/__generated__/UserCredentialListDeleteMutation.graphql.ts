/**
 * @generated SignedSource<<99619ff309884dfa5eca614323c69fcd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserCredentialListDeleteMutation$variables = {
  access_key: string;
};
export type UserCredentialListDeleteMutation$data = {
  readonly delete_keypair: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserCredentialListDeleteMutation = {
  response: UserCredentialListDeleteMutation$data;
  variables: UserCredentialListDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "access_key"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "access_key",
        "variableName": "access_key"
      }
    ],
    "concreteType": "DeleteKeyPair",
    "kind": "LinkedField",
    "name": "delete_keypair",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "UserCredentialListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserCredentialListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "00d579de4db39e2f3e48067fb19aaf72",
    "id": null,
    "metadata": {},
    "name": "UserCredentialListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation UserCredentialListDeleteMutation(\n  $access_key: String!\n) {\n  delete_keypair(access_key: $access_key) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "b955bc28ed14b19b153f202b0f1e6e22";

export default node;
