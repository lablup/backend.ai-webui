/**
 * @generated SignedSource<<1c9bfba51ad28a5dff4b06e6e008b864>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MyKeypairInfoModalLegacyQuery$variables = {
  email?: string | null | undefined;
};
export type MyKeypairInfoModalLegacyQuery$data = {
  readonly user: {
    readonly email: string | null | undefined;
    readonly main_access_key: string | null | undefined;
  } | null | undefined;
};
export type MyKeypairInfoModalLegacyQuery = {
  response: MyKeypairInfoModalLegacyQuery$data;
  variables: MyKeypairInfoModalLegacyQuery$variables;
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
  "name": "email",
  "storageKey": null
},
v3 = {
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
    "name": "MyKeypairInfoModalLegacyQuery",
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
    "name": "MyKeypairInfoModalLegacyQuery",
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
    "cacheID": "a9e216acf17f1804555484d00c53bd19",
    "id": null,
    "metadata": {},
    "name": "MyKeypairInfoModalLegacyQuery",
    "operationKind": "query",
    "text": "query MyKeypairInfoModalLegacyQuery(\n  $email: String\n) {\n  user(email: $email) {\n    email\n    main_access_key @since(version: \"23.09.7\")\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ad1f354d56581d4b7c8598b90fef3554";

export default node;
