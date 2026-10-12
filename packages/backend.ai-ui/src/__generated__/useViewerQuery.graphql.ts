/**
 * @generated SignedSource<<7c74709c46f2595f7622aaac21b54b6a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type useViewerQuery$variables = Record<PropertyKey, never>;
export type useViewerQuery$data = {
  readonly myUserV2: {
    readonly organization: {
      readonly role: UserRoleV2 | null | undefined;
    };
  } | null | undefined;
  readonly viewer: {
    readonly encoded_user_role: string | null | undefined;
    readonly user: {
      readonly email: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type useViewerQuery = {
  response: useViewerQuery$data;
  variables: useViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "encoded_user_role",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2OrganizationInfo",
  "kind": "LinkedField",
  "name": "organization",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useViewerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserNode",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useViewerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserNode",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4baddfc63cfa1fbd036f74f32cdd5e27",
    "id": null,
    "metadata": {},
    "name": "useViewerQuery",
    "operationKind": "query",
    "text": "query useViewerQuery {\n  viewer {\n    user {\n      email\n      id\n    }\n    encoded_user_role @deprecatedSince(version: \"26.2.0\")\n  }\n  myUserV2 @since(version: \"26.2.0\") {\n    organization {\n      role\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "70918f0a30f49f6bf9300a59049137ce";

export default node;
