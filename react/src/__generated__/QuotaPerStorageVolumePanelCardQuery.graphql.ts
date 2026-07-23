/**
 * @generated SignedSource<<2ac8873f6da5b21a5f0b0130cf6292c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type QuotaPerStorageVolumePanelCardQuery$variables = {
  project_quota_scope_id: string;
  skipQuotaScope: boolean;
  storage_host_name: string;
  user_quota_scope_id: string;
};
export type QuotaPerStorageVolumePanelCardQuery$data = {
  readonly project_quota_scope?: {
    readonly details: {
      readonly hard_limit_bytes: any | null | undefined;
      readonly usage_bytes: any | null | undefined;
    };
  } | null | undefined;
  readonly user_quota_scope?: {
    readonly details: {
      readonly hard_limit_bytes: any | null | undefined;
      readonly usage_bytes: any | null | undefined;
    };
  } | null | undefined;
};
export type QuotaPerStorageVolumePanelCardQuery = {
  response: QuotaPerStorageVolumePanelCardQuery$data;
  variables: QuotaPerStorageVolumePanelCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project_quota_scope_id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipQuotaScope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "storage_host_name"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_quota_scope_id"
},
v4 = {
  "kind": "Variable",
  "name": "storage_host_name",
  "variableName": "storage_host_name"
},
v5 = [
  {
    "kind": "Variable",
    "name": "quota_scope_id",
    "variableName": "project_quota_scope_id"
  },
  (v4/*: any*/)
],
v6 = {
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
      "name": "usage_bytes",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hard_limit_bytes",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = [
  (v6/*: any*/)
],
v8 = [
  {
    "kind": "Variable",
    "name": "quota_scope_id",
    "variableName": "user_quota_scope_id"
  },
  (v4/*: any*/)
],
v9 = [
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
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
    "name": "QuotaPerStorageVolumePanelCardQuery",
    "selections": [
      {
        "condition": "skipQuotaScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project_quota_scope",
            "args": (v5/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          },
          {
            "alias": "user_quota_scope",
            "args": (v8/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": (v7/*: any*/),
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
      (v3/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "QuotaPerStorageVolumePanelCardQuery",
    "selections": [
      {
        "condition": "skipQuotaScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "project_quota_scope",
            "args": (v5/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": (v9/*: any*/),
            "storageKey": null
          },
          {
            "alias": "user_quota_scope",
            "args": (v8/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": (v9/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "fc99573c07dc8de242fb081fee9a06ec",
    "id": null,
    "metadata": {},
    "name": "QuotaPerStorageVolumePanelCardQuery",
    "operationKind": "query",
    "text": "query QuotaPerStorageVolumePanelCardQuery(\n  $project_quota_scope_id: String!\n  $user_quota_scope_id: String!\n  $storage_host_name: String!\n  $skipQuotaScope: Boolean!\n) {\n  project_quota_scope: quota_scope(quota_scope_id: $project_quota_scope_id, storage_host_name: $storage_host_name) @skip(if: $skipQuotaScope) {\n    details {\n      usage_bytes\n      hard_limit_bytes\n    }\n    id\n  }\n  user_quota_scope: quota_scope(quota_scope_id: $user_quota_scope_id, storage_host_name: $storage_host_name) @skip(if: $skipQuotaScope) {\n    details {\n      usage_bytes\n      hard_limit_bytes\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "42686a1bb549aef69d91d7e59ffa88bb";

export default node;
