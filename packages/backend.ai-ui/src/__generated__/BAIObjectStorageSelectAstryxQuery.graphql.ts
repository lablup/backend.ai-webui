/**
 * @generated SignedSource<<f507a74037d210f8338b2f99e531b092>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIObjectStorageSelectAstryxQuery$variables = {
  limit: number;
  offset: number;
};
export type BAIObjectStorageSelectAstryxQuery$data = {
  readonly objectStorages: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type BAIObjectStorageSelectAstryxQuery = {
  response: BAIObjectStorageSelectAstryxQuery$data;
  variables: BAIObjectStorageSelectAstryxQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = [
  {
    "alias": null,
    "args": [
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
    "concreteType": "ObjectStorageConnection",
    "kind": "LinkedField",
    "name": "objectStorages",
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
        "concreteType": "ObjectStorageEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ObjectStorage",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIObjectStorageSelectAstryxQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIObjectStorageSelectAstryxQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b2c116e76975ce64d6cadc60f05089e6",
    "id": null,
    "metadata": {},
    "name": "BAIObjectStorageSelectAstryxQuery",
    "operationKind": "query",
    "text": "query BAIObjectStorageSelectAstryxQuery(\n  $offset: Int!\n  $limit: Int!\n) {\n  objectStorages(offset: $offset, limit: $limit) {\n    count\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "501cc91e96e7f0f98636b7089f0deb17";

export default node;
