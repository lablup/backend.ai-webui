/**
 * @generated SignedSource<<f75928fa0495272f7316ebaa2629c4ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasswordChangeRequestAlertQuery$variables = Record<PropertyKey, never>;
export type PasswordChangeRequestAlertQuery$data = {
  readonly myUserV2: {
    readonly status: {
      readonly needPasswordChange: boolean | null | undefined;
    };
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
  "concreteType": "UserV2StatusInfo",
  "kind": "LinkedField",
  "name": "status",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "needPasswordChange",
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
    "name": "PasswordChangeRequestAlertQuery",
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
    "name": "PasswordChangeRequestAlertQuery",
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
    "cacheID": "acd9f75ed99d084c67edaf42d6f1f5ba",
    "id": null,
    "metadata": {},
    "name": "PasswordChangeRequestAlertQuery",
    "operationKind": "query",
    "text": "query PasswordChangeRequestAlertQuery {\n  myUserV2 {\n    status {\n      needPasswordChange\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "4c28db8fbde7fcbdd47b63bb48b363ea";

export default node;
