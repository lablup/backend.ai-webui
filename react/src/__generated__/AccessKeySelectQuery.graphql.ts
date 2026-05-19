/**
 * @generated SignedSource<<eb75aa5fdca09e23b97955fbf69b32c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AccessKeySelectQuery$variables = {
  email: string;
};
export type AccessKeySelectQuery$data = {
  readonly keypairs: ReadonlyArray<{
    readonly access_key: string | null | undefined;
    readonly is_active: boolean | null | undefined;
  } | null | undefined> | null | undefined;
};
export type AccessKeySelectQuery = {
  response: AccessKeySelectQuery$data;
  variables: AccessKeySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_active",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AccessKeySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypairs",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AccessKeySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypairs",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "f8b8c1a3ee357c66b8050c241b494312",
    "id": null,
    "metadata": {},
    "name": "AccessKeySelectQuery",
    "operationKind": "query",
    "text": "query AccessKeySelectQuery(\n  $email: String!\n) {\n  keypairs(email: $email) {\n    access_key\n    is_active\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7facb8a400bfd30d710d936f1551e2fb";

export default node;
