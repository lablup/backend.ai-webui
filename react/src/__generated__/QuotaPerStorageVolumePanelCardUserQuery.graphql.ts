/**
 * @generated SignedSource<<a60ea1eddbf3d2a580ab94b2a238f6ef>>
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
      }
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
    "cacheID": "f5f947356fe539ea4ce1b606616220a6",
    "id": null,
    "metadata": {},
    "name": "QuotaPerStorageVolumePanelCardUserQuery",
    "operationKind": "query",
    "text": "query QuotaPerStorageVolumePanelCardUserQuery {\n  myUserV2 {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d501cb3ed1a87925830e95fb2c052478";

export default node;
