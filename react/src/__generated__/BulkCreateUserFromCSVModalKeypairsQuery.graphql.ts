/**
 * @generated SignedSource<<4af63fe2e0892c1edb7acc5c4b346b6f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BulkCreateUserFromCSVModalKeypairsQuery$variables = {
  email?: string | null | undefined;
};
export type BulkCreateUserFromCSVModalKeypairsQuery$data = {
  readonly keypairs: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
  } | null | undefined> | null | undefined;
};
export type BulkCreateUserFromCSVModalKeypairsQuery = {
  response: BulkCreateUserFromCSVModalKeypairsQuery$data;
  variables: BulkCreateUserFromCSVModalKeypairsQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BulkCreateUserFromCSVModalKeypairsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypairs",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "GeneratedKeypairListModalFragment"
          }
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
    "name": "BulkCreateUserFromCSVModalKeypairsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypairs",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "access_key",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "secret_key",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserInfo",
            "kind": "LinkedField",
            "name": "user_info",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "email",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
    "cacheID": "9cf305d9def2b4e0adf112a6e51f7fbb",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalKeypairsQuery",
    "operationKind": "query",
    "text": "query BulkCreateUserFromCSVModalKeypairsQuery(\n  $email: String\n) {\n  keypairs(email: $email) {\n    ...GeneratedKeypairListModalFragment\n    id\n  }\n}\n\nfragment GeneratedKeypairListModalFragment on KeyPair {\n  access_key\n  secret_key\n  user_info {\n    email\n  }\n}\n"
  }
};
})();

(node as any).hash = "a3ba0eded1be2734e0ab8faa00720e60";

export default node;
