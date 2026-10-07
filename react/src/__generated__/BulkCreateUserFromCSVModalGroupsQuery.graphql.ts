/**
 * @generated SignedSource<<d04f0f48bd7cccef7c50038fd264dd7c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkCreateUserFromCSVModalGroupsQuery$variables = {
  domainName: string;
  limit: number;
  offset: number;
};
export type BulkCreateUserFromCSVModalGroupsQuery$data = {
  readonly domainProjectsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type BulkCreateUserFromCSVModalGroupsQuery = {
  response: BulkCreateUserFromCSVModalGroupsQuery$data;
  variables: BulkCreateUserFromCSVModalGroupsQuery$variables;
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
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "isActive": true,
          "type": {
            "in_": [
              "GENERAL",
              "MODEL_STORE"
            ]
          }
        }
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
      },
      {
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "ASC",
            "field": "NAME"
          }
        ]
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "domainName",
            "variableName": "domainName"
          }
        ],
        "kind": "ObjectValue",
        "name": "scope"
      }
    ],
    "concreteType": "ProjectV2Connection",
    "kind": "LinkedField",
    "name": "domainProjectsV2",
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
        "concreteType": "ProjectV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2",
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
                "concreteType": "ProjectBasicInfo",
                "kind": "LinkedField",
                "name": "basicInfo",
                "plural": false,
                "selections": [
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "23a6f9865b7df7c88d62b7ce9ec85933",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "operationKind": "query",
    "text": "query BulkCreateUserFromCSVModalGroupsQuery(\n  $domainName: String!\n  $limit: Int!\n  $offset: Int!\n) {\n  domainProjectsV2(scope: {domainName: $domainName}, filter: {isActive: true, type: {in_: [GENERAL, MODEL_STORE]}}, orderBy: [{field: NAME, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4738069be68c896294686f8f95c261de";

export default node;
