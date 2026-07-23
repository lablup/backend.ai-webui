/**
 * @generated SignedSource<<b3429e7405e500fee4b598b5887f5d0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionOwnerSetterCardQuery$variables = {
  email: string;
};
export type SessionOwnerSetterCardQuery$data = {
  readonly keypairs: ReadonlyArray<{
    readonly access_key: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly user: {
    readonly domain_name: string | null | undefined;
    readonly groups: ReadonlyArray<{
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type SessionOwnerSetterCardQuery = {
  response: SessionOwnerSetterCardQuery$data;
  variables: SessionOwnerSetterCardQuery$variables;
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
  "name": "domain_name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    (v4/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionOwnerSetterCardQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypairs",
        "plural": true,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/)
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
    "name": "SessionOwnerSetterCardQuery",
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
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a8de553c14d6730a6825cba2f409be0d",
    "id": null,
    "metadata": {},
    "name": "SessionOwnerSetterCardQuery",
    "operationKind": "query",
    "text": "query SessionOwnerSetterCardQuery(\n  $email: String!\n) {\n  keypairs(email: $email) {\n    access_key\n    id\n  }\n  user(email: $email) {\n    domain_name\n    groups {\n      name\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ba086835ea654ab889e0e6aaefa0abfe";

export default node;
