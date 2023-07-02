/**
 * @generated SignedSource<<5de6b6644c875a46e1660d9c295d8203>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type QuotaScopeCardUnsetMutation$variables = {
  quota_scope_id: string;
  storage_host_name: string;
};
export type QuotaScopeCardUnsetMutation$data = {
  readonly unset_quota_scope: {
    readonly quota_scope: {
      readonly details: {
        readonly hard_limit_bytes: any | null;
      };
      readonly id: any;
      readonly quota_scope_id: string;
      readonly storage_host_name: string;
    } | null;
  } | null;
};
export type QuotaScopeCardUnsetMutation = {
  response: QuotaScopeCardUnsetMutation$data;
  variables: QuotaScopeCardUnsetMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "quota_scope_id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "storage_host_name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
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
    "concreteType": "UnsetQuotaScope",
    "kind": "LinkedField",
    "name": "unset_quota_scope",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "QuotaScope",
        "kind": "LinkedField",
        "name": "quota_scope",
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
            "name": "quota_scope_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "storage_host_name",
            "storageKey": null
          },
          {
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
    "name": "QuotaScopeCardUnsetMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "QuotaScopeCardUnsetMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "338836966362b14e823520f40fa56a73",
    "id": null,
    "metadata": {},
    "name": "QuotaScopeCardUnsetMutation",
    "operationKind": "mutation",
    "text": "mutation QuotaScopeCardUnsetMutation(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n) {\n  unset_quota_scope(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name) {\n    quota_scope {\n      id\n      quota_scope_id\n      storage_host_name\n      details {\n        hard_limit_bytes\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "272001cc642518fb66015dcc367b9f65";

export default node;
