/**
 * @generated SignedSource<<7b3da8dd7ce794c86ab740ad11478e6a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MyFoldersPanelQuery$variables = Record<PropertyKey, never>;
export type MyFoldersPanelQuery$data = {
  readonly folders: {
    readonly count: number;
  } | null | undefined;
  readonly myUserResourcePolicyV2: {
    readonly maxVfolderCount: number;
  } | null | undefined;
  readonly trash: {
    readonly count: number;
  } | null | undefined;
};
export type MyFoldersPanelQuery = {
  response: MyFoldersPanelQuery$data;
  variables: MyFoldersPanelQuery$variables;
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
  "alias": "folders",
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
    "name": "MyFoldersPanelQuery",
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
    "name": "MyFoldersPanelQuery",
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
    "cacheID": "5f29fb6cdbec56dd1a176c86aefe6349",
    "id": null,
    "metadata": {},
    "name": "MyFoldersPanelQuery",
    "operationKind": "query",
    "text": "query MyFoldersPanelQuery {\n  folders: myVfolders(filter: {status: {notIn: [DELETE_PENDING, DELETE_ONGOING, DELETE_COMPLETE, DELETE_ERROR]}}, limit: 1) {\n    count\n  }\n  trash: myVfolders(filter: {status: {equals: DELETE_PENDING}}, limit: 1) {\n    count\n  }\n  myUserResourcePolicyV2 {\n    maxVfolderCount\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "63b2988a872d06b373265cbbd1a5cb58";

export default node;
