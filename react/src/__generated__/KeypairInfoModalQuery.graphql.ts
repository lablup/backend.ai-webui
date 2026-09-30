/**
 * @generated SignedSource<<6f38b5643af9db792daaef9213e23b17>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairInfoModalQuery$variables = {
  domain_name?: string | null | undefined;
  email?: string | null | undefined;
  supportsKeypairIsDefault: boolean;
};
export type KeypairInfoModalQuery$data = {
  readonly user?: {
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
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsKeypairIsDefault"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "domain_name",
    "variableName": "domain_name"
  },
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
        "condition": "supportsKeypairIsDefault",
        "kind": "Condition",
        "passingValue": false,
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
        ]
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
        "condition": "supportsKeypairIsDefault",
        "kind": "Condition",
        "passingValue": false,
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
      }
    ]
  },
  "params": {
    "cacheID": "baa29a112df91300e2aeaf6872c748ad",
    "id": null,
    "metadata": {},
    "name": "KeypairInfoModalQuery",
    "operationKind": "query",
    "text": "query KeypairInfoModalQuery(\n  $domain_name: String\n  $email: String\n  $supportsKeypairIsDefault: Boolean!\n) {\n  user(domain_name: $domain_name, email: $email) @skip(if: $supportsKeypairIsDefault) {\n    main_access_key @since(version: \"24.03.0\")\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0edfe099f5e4f88747f7632ff90f51c1";

export default node;
