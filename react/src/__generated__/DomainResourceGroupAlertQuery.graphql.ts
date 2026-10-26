/**
 * @generated SignedSource<<8c516582b52b142a5ac5a00ec96b38c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupAlertQuery$variables = {
  domainName: string;
  resourceGroupName: string;
};
export type DomainResourceGroupAlertQuery$data = {
  readonly domainV2: {
    readonly resourceGroups: {
      readonly count: number;
    } | null | undefined;
  } | null | undefined;
};
export type DomainResourceGroupAlertQuery = {
  response: DomainResourceGroupAlertQuery$data;
  variables: DomainResourceGroupAlertQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resourceGroupName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v2 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "resourceGroupName"
            }
          ],
          "kind": "ObjectValue",
          "name": "name"
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    }
  ],
  "concreteType": "ResourceGroupConnection",
  "kind": "LinkedField",
  "name": "resourceGroups",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DomainResourceGroupAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DomainResourceGroupAlertQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "4b119aee9537d6fdf896ba60341c633c",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupAlertQuery(\n  $domainName: String!\n  $resourceGroupName: String!\n) {\n  domainV2(domainName: $domainName) {\n    resourceGroups(filter: {name: {equals: $resourceGroupName}}) @since(version: \"26.9.0a1\") {\n      count\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "41cc38552be27a35d7fc6fad12531589";

export default node;
