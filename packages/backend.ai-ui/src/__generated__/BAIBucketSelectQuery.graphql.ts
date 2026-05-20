/**
 * @generated SignedSource<<4676a45a2aebd527628d3a8b45b987e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIBucketSelectQuery$variables = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  limit: number;
  objectStorageId: string;
  offset: number;
};
export type BAIBucketSelectQuery$data = {
  readonly objectStorage: {
    readonly namespaces: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly namespace: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type BAIBucketSelectQuery = {
  response: BAIBucketSelectQuery$data;
  variables: BAIBucketSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "before"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "last"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "objectStorageId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "objectStorageId"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "after",
      "variableName": "after"
    },
    {
      "kind": "Variable",
      "name": "before",
      "variableName": "before"
    },
    {
      "kind": "Variable",
      "name": "first",
      "variableName": "first"
    },
    {
      "kind": "Variable",
      "name": "last",
      "variableName": "last"
    },
    {
      "kind": "Variable",
      "name": "limit",
      "variableName": "limit"
    },
    {
      "kind": "Variable",
      "name": "offset",
      "variableName": "offset"
    }
  ],
  "concreteType": "StorageNamespaceConnection",
  "kind": "LinkedField",
  "name": "namespaces",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "StorageNamespaceEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "StorageNamespace",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v8/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "namespace",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIBucketSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "ObjectStorage",
        "kind": "LinkedField",
        "name": "objectStorage",
        "plural": false,
        "selections": [
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v6/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIBucketSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "ObjectStorage",
        "kind": "LinkedField",
        "name": "objectStorage",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "dfe75c45f8a342024973e5b51f6946b2",
    "id": null,
    "metadata": {},
    "name": "BAIBucketSelectQuery",
    "operationKind": "query",
    "text": "query BAIBucketSelectQuery(\n  $offset: Int!\n  $limit: Int!\n  $objectStorageId: ID!\n  $first: Int\n  $last: Int\n  $before: String\n  $after: String\n) {\n  objectStorage(id: $objectStorageId) {\n    namespaces(offset: $offset, limit: $limit, first: $first, last: $last, before: $before, after: $after) {\n      count\n      edges {\n        node {\n          id\n          namespace\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e224afebab2a27b999cb53f837eb6f56";

export default node;
