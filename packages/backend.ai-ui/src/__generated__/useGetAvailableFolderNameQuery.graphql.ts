/**
 * @generated SignedSource<<2b242027746c3529490390517bd4dc86>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useGetAvailableFolderNameQuery$variables = {
  name: string;
};
export type useGetAvailableFolderNameQuery$data = {
  readonly myVfolders: {
    readonly count: number;
  } | null | undefined;
};
export type useGetAvailableFolderNameQuery = {
  response: useGetAvailableFolderNameQuery$data;
  variables: useGetAvailableFolderNameQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "equals",
                "variableName": "name"
              }
            ],
            "kind": "ObjectValue",
            "name": "name"
          },
          {
            "kind": "Literal",
            "name": "status",
            "value": {
              "notEquals": "DELETE_COMPLETE"
            }
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      }
    ],
    "concreteType": "VFolderConnection",
    "kind": "LinkedField",
    "name": "myVfolders",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useGetAvailableFolderNameQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useGetAvailableFolderNameQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "34241e6cf2072260c2f4f5a6fb7513a5",
    "id": null,
    "metadata": {},
    "name": "useGetAvailableFolderNameQuery",
    "operationKind": "query",
    "text": "query useGetAvailableFolderNameQuery(\n  $name: String!\n) {\n  myVfolders(filter: {name: {equals: $name}, status: {notEquals: DELETE_COMPLETE}}) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "b9ae41e4d9135d59c63afcd071429829";

export default node;
