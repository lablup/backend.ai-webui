/**
 * @generated SignedSource<<e0e8ac2722fb667ae9c07fe58ee07404>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useGetAvailableFolderNameQuery$variables = {
  legacyFilter: string;
  name: string;
  readsV2: boolean;
};
export type useGetAvailableFolderNameQuery$data = {
  readonly myVfolders?: {
    readonly count: number;
  } | null | undefined;
  readonly vfolder_nodes?: {
    readonly count: number | null | undefined;
  } | null | undefined;
};
export type useGetAvailableFolderNameQuery = {
  response: useGetAvailableFolderNameQuery$data;
  variables: useGetAvailableFolderNameQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "legacyFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "readsV2"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v4 = [
  {
    "condition": "readsV2",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
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
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "readsV2",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "legacyFilter"
          },
          {
            "kind": "Literal",
            "name": "permission",
            "value": "read_attribute"
          }
        ],
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useGetAvailableFolderNameQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "useGetAvailableFolderNameQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "b5e933e49c50c1a8b0377db1835f511f",
    "id": null,
    "metadata": {},
    "name": "useGetAvailableFolderNameQuery",
    "operationKind": "query",
    "text": "query useGetAvailableFolderNameQuery(\n  $name: String!\n  $legacyFilter: String!\n  $readsV2: Boolean!\n) {\n  myVfolders(filter: {name: {equals: $name}, status: {notEquals: DELETE_COMPLETE}}) @include(if: $readsV2) @since(version: \"26.4.2\") {\n    count\n  }\n  vfolder_nodes(filter: $legacyFilter, permission: \"read_attribute\") @skip(if: $readsV2) @deprecatedSince(version: \"26.4.2\") {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "c297edce2f6bc2b65806e05809dbf78c";

export default node;
