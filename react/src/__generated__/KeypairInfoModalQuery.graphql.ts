/**
 * @generated SignedSource<<2ccec4ac990f027abbf2ffd7c97eb133>>
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
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
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
    "cacheID": "7e7b82b2a12891405f7f408c9e006c63",
    "id": null,
    "metadata": {},
    "name": "KeypairInfoModalQuery",
    "operationKind": "query",
    "text": "query KeypairInfoModalQuery(\n  $domain_name: String\n  $email: String\n) {\n  user(domain_name: $domain_name, email: $email) {\n    main_access_key\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "03ab73a9934cfbc7eda316ddd63bb761";

export default node;
