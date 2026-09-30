/**
 * @generated SignedSource<<e297af86cca40167e351de07fa22fdf5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = {
  limit: number;
  supportsResourcePolicyV2: boolean;
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsResourcePolicyV2"
  }
],
v1 = [
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
v2 = [
  {
    "condition": "supportsResourcePolicyV2",
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
                "selections": (v1/*: any*/),
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
    "condition": "supportsResourcePolicyV2",
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
        "selections": (v1/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2619526973e0edb188bc9fd96cc676d3",
    "id": null,
    "metadata": {},
    "name": "BAIProjectResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query BAIProjectResourcePolicySelectQuery(\n  $limit: Int!\n  $supportsResourcePolicyV2: Boolean!\n) {\n  adminProjectResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $supportsResourcePolicyV2) @since(version: \"26.4.2\") {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n  project_resource_policies @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "439df4d2e35fc7c668b6284d96f5589e";

export default node;
