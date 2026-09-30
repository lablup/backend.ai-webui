/**
 * @generated SignedSource<<f28e66cadeb2ec980642b4e57c8a9886>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type backendaiCurrentUserRoleQuery$variables = Record<PropertyKey, never>;
export type backendaiCurrentUserRoleQuery$data = {
  readonly myUserV2: {
    readonly organization: {
      readonly role: UserRoleV2 | null | undefined;
    };
  } | null | undefined;
};
export type backendaiCurrentUserRoleQuery = {
  response: backendaiCurrentUserRoleQuery$data;
  variables: backendaiCurrentUserRoleQuery$variables;
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
    "name": "backendaiCurrentUserRoleQuery",
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
    "name": "backendaiCurrentUserRoleQuery",
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
    "cacheID": "e7cddb046a9083010225fa38eb84df24",
    "id": null,
    "metadata": {},
    "name": "backendaiCurrentUserRoleQuery",
    "operationKind": "query",
    "text": "query backendaiCurrentUserRoleQuery {\n  myUserV2 {\n    organization {\n      role\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6b33d28c350d7c2dfc3c3417419409a9";

export default node;
