/**
 * @generated SignedSource<<bf508145cfe3f8db11ef92a3c2a1ce7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type QuotaPerStorageVolumePanelCardUserQuery$variables = Record<PropertyKey, never>;
export type QuotaPerStorageVolumePanelCardUserQuery$data = {
  readonly myUserV2: {
    readonly entityId: string;
  } | null | undefined;
  readonly user: {
    readonly id: string | null | undefined;
  } | null | undefined;
};
export type QuotaPerStorageVolumePanelCardUserQuery = {
  response: QuotaPerStorageVolumePanelCardUserQuery$data;
  variables: QuotaPerStorageVolumePanelCardUserQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v1/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
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
      },
      (v2/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
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
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "8e75201146ca467082cf53e764c1eaae",
    "id": null,
    "metadata": {},
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "operationKind": "query",
    "text": "query QuotaPerStorageVolumePanelCardUserQuery {\n  myUserV2 {\n    entityId @since(version: \"26.9.0\")\n    id\n  }\n  user @deprecatedSince(version: \"26.9.0\") {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3a6365baa8c1bc1b6c219238241b791e";

export default node;
