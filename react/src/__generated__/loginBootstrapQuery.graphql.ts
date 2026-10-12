/**
 * @generated SignedSource<<9c58584ff1190a1e7f71041e28077ba7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type loginBootstrapQuery$variables = Record<PropertyKey, never>;
export type loginBootstrapQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly description: string | null | undefined;
    readonly id: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly keypair: {
    readonly access_key: string | null | undefined;
    readonly resource_policy: string | null | undefined;
    readonly user: string | null | undefined;
    readonly user_id: string | null | undefined;
  } | null | undefined;
  readonly user: {
    readonly domain_name: string | null | undefined;
    readonly email: string | null | undefined;
    readonly full_name: string | null | undefined;
    readonly groups: ReadonlyArray<{
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly need_password_change: boolean | null | undefined;
    readonly role: string | null | undefined;
    readonly username: string | null | undefined;
    readonly uuid: string | null | undefined;
  } | null | undefined;
};
export type loginBootstrapQuery = {
  response: loginBootstrapQuery$data;
  variables: loginBootstrapQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "full_name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_active",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domain_name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "need_password_change",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uuid",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "is_active",
      "value": true
    },
    {
      "kind": "Literal",
      "name": "type",
      "value": [
        "GENERAL"
      ]
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v11/*: any*/),
    (v10/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    (v7/*: any*/)
  ],
  "storageKey": "groups(is_active:true,type:[\"GENERAL\"])"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "loginBootstrapQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypair",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/)
        ],
        "storageKey": null
      },
      (v15/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "loginBootstrapQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypair",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v11/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/),
          (v11/*: any*/)
        ],
        "storageKey": null
      },
      (v15/*: any*/)
    ]
  },
  "params": {
    "cacheID": "d9b6d483469c0e2c01670a3e0c305b4e",
    "id": null,
    "metadata": {},
    "name": "loginBootstrapQuery",
    "operationKind": "query",
    "text": "query loginBootstrapQuery {\n  keypair {\n    access_key\n    user_id\n    resource_policy\n    user\n    id\n  }\n  user {\n    username\n    email\n    full_name\n    is_active\n    role\n    domain_name\n    groups {\n      name\n      id\n    }\n    need_password_change\n    uuid\n    id\n  }\n  groups(is_active: true, type: [\"GENERAL\"]) {\n    id\n    name\n    description\n    is_active\n  }\n}\n"
  }
};
})();

(node as any).hash = "54d04a587d378dbf301b5cb2fbd0ba55";

export default node;
