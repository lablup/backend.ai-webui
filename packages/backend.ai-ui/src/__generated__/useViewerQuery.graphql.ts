/**
 * @generated SignedSource<<2d5472cf16f2f36d8d9c52822cd2dca3>>
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
};
export type useViewerQuery = {
  response: useViewerQuery$data;
  variables: useViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
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
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "2365c95d23367c591783462fa054bdf6",
    "id": null,
    "metadata": {},
    "name": "useViewerQuery",
    "operationKind": "query",
    "text": "query useViewerQuery {\n  myUserV2 {\n    organization {\n      role\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e32f43bceed495270720030b058c19d";

export default node;
