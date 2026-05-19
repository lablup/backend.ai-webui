/**
 * @generated SignedSource<<841d0a3cdf41f849049b02226ae17692>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasswordChangeRequestAlertQuery$variables = Record<PropertyKey, never>;
export type PasswordChangeRequestAlertQuery$data = {
  readonly user: {
    readonly need_password_change: boolean | null | undefined;
  } | null | undefined;
};
export type PasswordChangeRequestAlertQuery = {
  response: PasswordChangeRequestAlertQuery$data;
  variables: PasswordChangeRequestAlertQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "need_password_change",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PasswordChangeRequestAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
    "name": "PasswordChangeRequestAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
    "cacheID": "533382334f8b565412a9a20126466e7d",
    "id": null,
    "metadata": {},
    "name": "PasswordChangeRequestAlertQuery",
    "operationKind": "query",
    "text": "query PasswordChangeRequestAlertQuery {\n  user {\n    need_password_change\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a0c9b235a9f295a7e474d1f045860789";

export default node;
