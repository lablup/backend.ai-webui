/**
 * @generated SignedSource<<5bfbeb4d8b71803ee22d398f75c1d90e>>
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
export type RetentionPolicyFilter = {
  category?: RetentionCategory | null | undefined;
  enabled?: boolean | null | undefined;
};
export type RetentionPolicyOrderBy = {
  direction?: string;
  field: RetentionPolicyOrderField;
};
export type AdminRetentionPolicyQuery$variables = {
  filter?: RetentionPolicyFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RetentionPolicyOrderBy> | null | undefined;
};
export type AdminRetentionPolicyQuery$data = {
  readonly adminRetentionPolicies: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: RetentionCategory;
        readonly entityId: string;
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIAdminRetentionPolicyTableFragment" | "RetentionPolicySettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type AdminRetentionPolicyQuery = {
  response: AdminRetentionPolicyQuery$data;
  variables: AdminRetentionPolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminRetentionPolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RetentionPolicySettingModalFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIAdminRetentionPolicyTableFragment"
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
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminRetentionPolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "retentionPeriodDays",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "enabled",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lastSweptAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "updatedAt",
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
    ]
  },
  "params": {
    "cacheID": "879104e8cf324117c328324b54809fc3",
    "id": null,
    "metadata": {},
    "name": "AdminRetentionPolicyQuery",
    "operationKind": "query",
    "text": "query AdminRetentionPolicyQuery(\n  $filter: RetentionPolicyFilter\n  $orderBy: [RetentionPolicyOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminRetentionPolicies(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        category\n        ...RetentionPolicySettingModalFragment\n        ...BAIAdminRetentionPolicyTableFragment\n      }\n    }\n  }\n}\n\nfragment BAIAdminRetentionPolicyTableFragment on RetentionPolicy {\n  id\n  category\n  retentionPeriodDays\n  enabled\n  lastSweptAt\n  createdAt\n  updatedAt\n}\n\nfragment RetentionPolicySettingModalFragment on RetentionPolicy {\n  id\n  entityId\n  category\n  retentionPeriodDays\n  enabled\n}\n"
  }
};
})();

(node as any).hash = "ada5fad63f5b04d0c631243d79b4d718";

export default node;
