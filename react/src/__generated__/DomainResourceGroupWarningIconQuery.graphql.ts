/**
 * @generated SignedSource<<4f00d4adb4c0a5969db221a56de8b2af>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupWarningIconQuery$variables = {
  domainName: string;
  resourceGroupName: string;
};
export type DomainResourceGroupWarningIconQuery$data = {
  readonly domainV2: {
    readonly resourceGroups: {
      readonly count: number;
    } | null | undefined;
  } | null | undefined;
};
export type DomainResourceGroupWarningIconQuery = {
  response: DomainResourceGroupWarningIconQuery$data;
  variables: DomainResourceGroupWarningIconQuery$variables;
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
    "name": "DomainResourceGroupWarningIconQuery",
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
    "name": "DomainResourceGroupWarningIconQuery",
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
    "cacheID": "daaa02ebd42a205f7af2dbb18869cab9",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupWarningIconQuery(\n  $domainName: String!\n  $resourceGroupName: String!\n) {\n  domainV2(domainName: $domainName) {\n    resourceGroups(filter: {name: {equals: $resourceGroupName}}) @since(version: \"26.9.0a1\") {\n      count\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "dc85f461b38ceb52eab07ef43fb4fb62";

export default node;
