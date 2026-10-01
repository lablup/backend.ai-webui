/**
 * @generated SignedSource<<9866cc7d566efd495a414e23a9ebb50c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = {
  isSuperAdmin: boolean;
  limit: number;
};
export type BAIProjectResourcePolicySelectQuery$data = {
  readonly adminProjectResourcePoliciesV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
  readonly project_resource_policies?: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  } | null | undefined> | null | undefined;
};
export type BAIProjectResourcePolicySelectQuery = {
  response: BAIProjectResourcePolicySelectQuery$data;
  variables: BAIProjectResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = [
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
v3 = [
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
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
                "selections": (v2/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policies",
        "plural": true,
        "selections": (v2/*: any*/),
        "storageKey": null
      }
    ]
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
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v3/*: any*/),
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
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "6fa2930c993b5bab286f46d59d192a40",
    "id": null,
    "metadata": {},
    "name": "BAIProjectResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query BAIProjectResourcePolicySelectQuery(\n  $limit: Int!\n  $isSuperAdmin: Boolean!\n) {\n  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $isSuperAdmin) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n  project_resource_policies @skip(if: $isSuperAdmin) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "133bc6b0a14a92d46be068cad9e85d90";

export default node;
