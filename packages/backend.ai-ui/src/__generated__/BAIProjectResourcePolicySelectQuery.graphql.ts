/**
 * @generated SignedSource<<6ba61de61f42335a61635371c223d47a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = {
  limit: number;
};
export type BAIProjectResourcePolicySelectQuery$data = {
  readonly adminProjectResourcePoliciesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type BAIProjectResourcePolicySelectQuery = {
  response: BAIProjectResourcePolicySelectQuery$data;
  variables: BAIProjectResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
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
      }
    ],
    "concreteType": "ProjectResourcePolicyV2Connection",
    "kind": "LinkedField",
    "name": "adminProjectResourcePoliciesV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicyV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectResourcePolicyV2",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6a3fd80d898f34a903548c48ccf308ce",
    "id": null,
    "metadata": {},
    "name": "BAIProjectResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query BAIProjectResourcePolicySelectQuery(\n  $limit: Int!\n) {\n  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c0a5c2859443c7fc9caad17553e6b91b";

export default node;
