/**
 * @generated SignedSource<<a0f758bddb9257c090f788825580fbdd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
export type RetentionPolicyOrderField = "CATEGORY" | "CREATED_AT" | "LAST_SWEPT_AT" | "%future added value";
export type RetentionPolicyOrderBy = {
  direction?: string;
  field: RetentionPolicyOrderField;
};
export type RetentionPolicyListQuery$variables = {
  orderBy?: ReadonlyArray<RetentionPolicyOrderBy> | null | undefined;
};
export type RetentionPolicyListQuery$data = {
  readonly adminRetentionPolicies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: RetentionCategory;
        readonly createdAt: string;
        readonly enabled: boolean;
        readonly id: string;
        readonly lastSweptAt: string | null | undefined;
        readonly retentionPeriodDays: number;
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"RetentionPolicySettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type RetentionPolicyListQuery = {
  response: RetentionPolicyListQuery$data;
  variables: RetentionPolicyListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBy"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "retentionPeriodDays",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastSweptAt",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RetentionPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RetentionPolicySettingModalFragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/)
                ],
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
  "params": {
    "cacheID": "c2a7f42ee8545a7f5d56c7d77e8e7edc",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicyListQuery",
    "operationKind": "query",
    "text": "query RetentionPolicyListQuery(\n  $orderBy: [RetentionPolicyOrderBy!]\n) {\n  adminRetentionPolicies(orderBy: $orderBy) {\n    edges {\n      node {\n        id\n        category\n        retentionPeriodDays\n        enabled\n        lastSweptAt\n        createdAt\n        updatedAt\n        ...RetentionPolicySettingModalFragment\n      }\n    }\n  }\n}\n\nfragment RetentionPolicySettingModalFragment on RetentionPolicy {\n  id\n  category\n  retentionPeriodDays\n  enabled\n}\n"
  }
};
})();

(node as any).hash = "cc5b6aa8ac262c288a1846cd76e94bf9";

export default node;
