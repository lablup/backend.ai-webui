/**
 * @generated SignedSource<<427b3df6aa8b683181aac739a920c277>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClientIPMaskingMode = "DROP" | "NONE" | "TRUNCATE" | "%future added value";
export type ClientIPMaskingPolicyOrderField = "CREATED_AT" | "MODE" | "TARGET_TYPE" | "UPDATED_AT" | "%future added value";
export type ClientIPMaskingTarget = "AUDIT_LOGS" | "DEFAULT" | "LOGIN_HISTORY" | "%future added value";
export type ClientIPMaskingPolicyOrderBy = {
  direction?: string;
  field: ClientIPMaskingPolicyOrderField;
};
export type AdminClientIpMaskingPolicyListQuery$variables = {
  limit?: number | null | undefined;
  orderBy?: ReadonlyArray<ClientIPMaskingPolicyOrderBy> | null | undefined;
};
export type AdminClientIpMaskingPolicyListQuery$data = {
  readonly adminClientIpMaskingPolicies: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly ipv4Prefix: number | null | undefined;
        readonly ipv6Prefix: number | null | undefined;
        readonly mode: ClientIPMaskingMode;
        readonly targetType: ClientIPMaskingTarget;
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"ClientIpMaskingPolicySettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type AdminClientIpMaskingPolicyListQuery = {
  response: AdminClientIpMaskingPolicyListQuery$data;
  variables: AdminClientIpMaskingPolicyListQuery$variables;
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
  "name": "orderBy"
},
v2 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetType",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mode",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ipv4Prefix",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ipv6Prefix",
  "storageKey": null
},
v10 = {
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminClientIpMaskingPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ClientIPMaskingPolicyConnection",
        "kind": "LinkedField",
        "name": "adminClientIpMaskingPolicies",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ClientIPMaskingPolicyEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ClientIPMaskingPolicy",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ClientIpMaskingPolicySettingModalFragment"
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminClientIpMaskingPolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ClientIPMaskingPolicyConnection",
        "kind": "LinkedField",
        "name": "adminClientIpMaskingPolicies",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ClientIPMaskingPolicyEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ClientIPMaskingPolicy",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/)
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
    "cacheID": "81a662f36ac3592874e27ce446ab7295",
    "id": null,
    "metadata": {},
    "name": "AdminClientIpMaskingPolicyListQuery",
    "operationKind": "query",
    "text": "query AdminClientIpMaskingPolicyListQuery(\n  $orderBy: [ClientIPMaskingPolicyOrderBy!]\n  $limit: Int\n) {\n  adminClientIpMaskingPolicies(orderBy: $orderBy, limit: $limit) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        targetType\n        mode\n        ipv4Prefix\n        ipv6Prefix\n        updatedAt\n        ...ClientIpMaskingPolicySettingModalFragment\n      }\n    }\n  }\n}\n\nfragment ClientIpMaskingPolicySettingModalFragment on ClientIPMaskingPolicy {\n  id\n  entityId\n  targetType\n  mode\n  ipv4Prefix\n  ipv6Prefix\n}\n"
  }
};
})();

(node as any).hash = "6e11f984834cd12bcd3ebf6563b7c764";

export default node;
