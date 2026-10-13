/**
 * @generated SignedSource<<f0c7e8ba053e9e2ea63853c552074397>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
export type RetentionPolicyFilter = {
  category?: RetentionCategory | null | undefined;
  enabled?: boolean | null | undefined;
};
export type RetentionPolicySettingModalCategoryCheckQuery$variables = {
  filter?: RetentionPolicyFilter | null | undefined;
};
export type RetentionPolicySettingModalCategoryCheckQuery$data = {
  readonly adminRetentionPolicies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type RetentionPolicySettingModalCategoryCheckQuery = {
  response: RetentionPolicySettingModalCategoryCheckQuery$data;
  variables: RetentionPolicySettingModalCategoryCheckQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      }
    ],
    "concreteType": "RetentionPolicyConnection",
    "kind": "LinkedField",
    "name": "adminRetentionPolicies",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RetentionPolicyEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RetentionPolicy",
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
    "name": "RetentionPolicySettingModalCategoryCheckQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicySettingModalCategoryCheckQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5e0ffeb6e84447a6f4d2fe10751c61df",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicySettingModalCategoryCheckQuery",
    "operationKind": "query",
    "text": "query RetentionPolicySettingModalCategoryCheckQuery(\n  $filter: RetentionPolicyFilter\n) {\n  adminRetentionPolicies(filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a38aea51b7a2a6316cc948fb76c73b81";

export default node;
