/**
 * @generated SignedSource<<f128928ba46f33991ea66d324fbb0d17>>
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
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RetentionPolicyOrderBy> | null | undefined;
};
export type RetentionPolicyListQuery$data = {
  readonly adminRetentionPolicies: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: RetentionCategory;
        readonly createdAt: string;
        readonly enabled: boolean;
        readonly entityId: string;
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
  "name": "orderBy"
},
v3 = [
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
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "retentionPeriodDays",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastSweptAt",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RetentionPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RetentionPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/)
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
    "cacheID": "d0c87fdc4bf08a254d9da678c8d4e23b",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicyListQuery",
    "operationKind": "query",
    "text": "query RetentionPolicyListQuery(\n  $orderBy: [RetentionPolicyOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminRetentionPolicies(orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        category\n        retentionPeriodDays\n        enabled\n        lastSweptAt\n        createdAt\n        updatedAt\n        ...RetentionPolicySettingModalFragment\n      }\n    }\n  }\n}\n\nfragment RetentionPolicySettingModalFragment on RetentionPolicy {\n  id\n  entityId\n  category\n  retentionPeriodDays\n  enabled\n}\n"
  }
};
})();

(node as any).hash = "f884944ddccd4acb3ebcff14acf688bf";

export default node;
