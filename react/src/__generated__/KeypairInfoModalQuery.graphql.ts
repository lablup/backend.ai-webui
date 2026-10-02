/**
 * @generated SignedSource<<ec4ee8d6612a4195ad1d49893f36908e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairInfoModalQuery$variables = {
  email?: string | null | undefined;
};
export type KeypairInfoModalQuery$data = {
  readonly user: {
    readonly main_access_key: string | null | undefined;
  } | null | undefined;
};
export type KeypairInfoModalQuery = {
  response: KeypairInfoModalQuery$data;
  variables: KeypairInfoModalQuery$variables;
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
  "name": "main_access_key",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairInfoModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "KeypairInfoModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
    ]
  },
  "params": {
    "cacheID": "c859c046deec1611a23f3a4860a9ff78",
    "id": null,
    "metadata": {},
    "name": "KeypairInfoModalQuery",
    "operationKind": "query",
    "text": "query KeypairInfoModalQuery(\n  $email: String\n) {\n  user(email: $email) {\n    main_access_key\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "023d2c82d97b825cecdf0daf2ca4c7e3";

export default node;
