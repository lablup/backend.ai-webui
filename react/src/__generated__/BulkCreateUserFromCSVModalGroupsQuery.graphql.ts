/**
 * @generated SignedSource<<b2fbd45a9549a73604c84353f07c9587>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkCreateUserFromCSVModalGroupsQuery$variables = {
  domainName: string;
};
export type BulkCreateUserFromCSVModalGroupsQuery$data = {
  readonly domainProjectsV2: {
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
        "kind": "Literal",
        "name": "limit",
        "value": 1000
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
    "cacheID": "c34419b328647f9b41ddcddbfe180cb6",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "operationKind": "query",
    "text": "query BulkCreateUserFromCSVModalGroupsQuery(\n  $domainName: String!\n) {\n  domainProjectsV2(scope: {domainName: $domainName}, filter: {isActive: true, type: {in_: [GENERAL, MODEL_STORE]}}, limit: 1000) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1b6637526e30009f2e5e4c914bfbc5c";

export default node;
