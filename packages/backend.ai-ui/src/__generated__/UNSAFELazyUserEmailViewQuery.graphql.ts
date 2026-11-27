/**
 * @generated SignedSource<<7eec1e1505a8ebb1e7befaa1feb99aa1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  role?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type UNSAFELazyUserEmailViewQuery$variables = {
  scope: UserScope;
  uuid: string;
};
export type UNSAFELazyUserEmailViewQuery$data = {
  readonly scopedUsersV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly email: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type UNSAFELazyUserEmailViewQuery = {
  response: UNSAFELazyUserEmailViewQuery$data;
  variables: UNSAFELazyUserEmailViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uuid"
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
                "variableName": "uuid"
              }
            ],
            "kind": "ObjectValue",
            "name": "entityId"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      },
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "UserV2Connection",
    "kind": "LinkedField",
    "name": "scopedUsersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2",
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
                "concreteType": "UserV2BasicInfo",
                "kind": "LinkedField",
                "name": "basicInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "email",
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
    "name": "UNSAFELazyUserEmailViewQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UNSAFELazyUserEmailViewQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2e65e0bf2d52e40ab3683fabefd46509",
    "id": null,
    "metadata": {},
    "name": "UNSAFELazyUserEmailViewQuery",
    "operationKind": "query",
    "text": "query UNSAFELazyUserEmailViewQuery(\n  $scope: UserScope!\n  $uuid: UUID!\n) {\n  scopedUsersV2(scope: $scope, filter: {entityId: {equals: $uuid}}, limit: 1) {\n    edges {\n      node {\n        id\n        basicInfo {\n          email\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c2eca30463d0b069ac333d707944ee15";

export default node;
