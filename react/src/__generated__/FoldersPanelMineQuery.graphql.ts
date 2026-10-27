/**
 * @generated SignedSource<<14130ba67e7694b56323590bbaf428e1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FoldersPanelMineQuery$variables = Record<PropertyKey, never>;
export type FoldersPanelMineQuery$data = {
  readonly myUserResourcePolicyV2: {
    readonly maxVfolderCount: number;
  } | null | undefined;
  readonly ready: {
    readonly count: number;
  } | null | undefined;
  readonly trash: {
    readonly count: number;
  } | null | undefined;
};
export type FoldersPanelMineQuery = {
  response: FoldersPanelMineQuery$data;
  variables: FoldersPanelMineQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v2 = {
  "alias": "ready",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "notIn": [
            "DELETE_PENDING",
            "DELETE_ONGOING",
            "DELETE_COMPLETE",
            "DELETE_ERROR"
          ]
        }
      }
    },
    (v0/*: any*/)
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "myVfolders",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": "myVfolders(filter:{\"status\":{\"notIn\":[\"DELETE_PENDING\",\"DELETE_ONGOING\",\"DELETE_COMPLETE\",\"DELETE_ERROR\"]}},limit:1)"
},
v3 = {
  "alias": "trash",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "DELETE_PENDING"
        }
      }
    },
    (v0/*: any*/)
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "myVfolders",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": "myVfolders(filter:{\"status\":{\"equals\":\"DELETE_PENDING\"}},limit:1)"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxVfolderCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FoldersPanelMineQuery",
    "selections": [
      (v2/*: any*/),
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myUserResourcePolicyV2",
        "plural": false,
        "selections": [
          (v4/*: any*/)
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
    "name": "FoldersPanelMineQuery",
    "selections": [
      (v2/*: any*/),
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myUserResourcePolicyV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
    "cacheID": "b9a1de08dbf6000e3357736882d467f9",
    "id": null,
    "metadata": {},
    "name": "FoldersPanelMineQuery",
    "operationKind": "query",
    "text": "query FoldersPanelMineQuery {\n  ready: myVfolders(filter: {status: {notIn: [DELETE_PENDING, DELETE_ONGOING, DELETE_COMPLETE, DELETE_ERROR]}}, limit: 1) {\n    count\n  }\n  trash: myVfolders(filter: {status: {equals: DELETE_PENDING}}, limit: 1) {\n    count\n  }\n  myUserResourcePolicyV2 {\n    maxVfolderCount\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8896f721a1da7e43a369856740710646";

export default node;
