/**
 * @generated SignedSource<<4cddf9f901b7c98f7b0d801d421938b4>>
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
  entityId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type RetentionPolicySettingModalCategoryCheckQuery$variables = {
  filter?: RetentionPolicyFilter | null | undefined;
};
export type RetentionPolicySettingModalCategoryCheckQuery$data = {
  readonly adminRetentionPolicies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityId",
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
    "cacheID": "1cc9c72a481d5948bb02fb60fa99b168",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicySettingModalCategoryCheckQuery",
    "operationKind": "query",
    "text": "query RetentionPolicySettingModalCategoryCheckQuery(\n  $filter: RetentionPolicyFilter\n) {\n  adminRetentionPolicies(filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "844994920593debe93abb72f8437eb0a";

export default node;
