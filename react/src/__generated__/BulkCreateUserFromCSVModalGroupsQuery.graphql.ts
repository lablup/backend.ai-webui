/**
 * @generated SignedSource<<7db03a9019f730e8b1cb80006375e6d9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type BulkCreateUserFromCSVModalGroupsQuery$variables = {
  limit: number;
  offset: number;
  scope: ProjectScope;
};
export type BulkCreateUserFromCSVModalGroupsQuery$data = {
  readonly scopedProjectsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly entityId: string;
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
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = [
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
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "ProjectV2Connection",
    "kind": "LinkedField",
    "name": "scopedProjectsV2",
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
                "kind": "ScalarField",
                "name": "entityId",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ce9a72166565fc33b6815b19e2ba62fb",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalGroupsQuery",
    "operationKind": "query",
    "text": "query BulkCreateUserFromCSVModalGroupsQuery(\n  $scope: ProjectScope!\n  $limit: Int!\n  $offset: Int!\n) {\n  scopedProjectsV2(scope: $scope, filter: {isActive: true, type: {in_: [GENERAL, MODEL_STORE]}}, orderBy: [{field: NAME, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "613168e14a6b600095fb2ab1c3cd3828";

export default node;
