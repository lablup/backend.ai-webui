/**
 * @generated SignedSource<<bc93f0998477321b30545a5bd82f1f57>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type QuotaScopeTableQuery$variables = {
  quota_scope_id: string;
  skip: boolean;
  storage_host_name: string;
};
export type QuotaScopeTableQuery$data = {
  readonly quota_scope?: {
    readonly details: {
      readonly hard_limit_bytes: any | null | undefined;
      readonly usage_bytes: any | null | undefined;
    };
    readonly id: string;
    readonly quota_scope_id: string;
    readonly storage_host_name: string;
    readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
  } | null | undefined;
};
export type QuotaScopeTableQuery = {
  response: QuotaScopeTableQuery$data;
  variables: QuotaScopeTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "quota_scope_id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "storage_host_name"
},
v3 = [
  {
    "kind": "Variable",
    "name": "quota_scope_id",
    "variableName": "quota_scope_id"
  },
  {
    "kind": "Variable",
    "name": "storage_host_name",
    "variableName": "storage_host_name"
  }
],
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
  "name": "quota_scope_id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "storage_host_name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "QuotaDetails",
  "kind": "LinkedField",
  "name": "details",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hard_limit_bytes",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "usage_bytes",
      "storageKey": null
    }
  ],
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
    "name": "QuotaScopeTableQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "QuotaSettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "QuotaScopeTableQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "ea651fafb344dd186df35787fb4dd072",
    "id": null,
    "metadata": {},
    "name": "QuotaScopeTableQuery",
    "operationKind": "query",
    "text": "query QuotaScopeTableQuery(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $skip: Boolean!\n) {\n  quota_scope(storage_host_name: $storage_host_name, quota_scope_id: $quota_scope_id) @skip(if: $skip) {\n    id\n    quota_scope_id\n    storage_host_name\n    details {\n      hard_limit_bytes\n      usage_bytes\n    }\n    ...QuotaSettingModalFragment\n  }\n}\n\nfragment QuotaSettingModalFragment on QuotaScope {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b97ff2b41ea8380d49df07e12990635";

export default node;
