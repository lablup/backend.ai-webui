/**
 * @generated SignedSource<<e42ed3dc0d35068f8b882d1a99fca166>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingsPanelQuery$variables = {
  project_resource_policy_name: string;
  quota_scope_id: string;
  skipProjectResourcePolicy: boolean;
  skipQuotaScope: boolean;
  skipUserResourcePolicy: boolean;
  storage_host_name: string;
  user_resource_policy_name?: string | null;
};
export type StorageHostSettingsPanelQuery$data = {
  readonly project_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"ResourcePolicyCard_project_resource_policy">;
  } | null;
  readonly quota_scope?: {
    readonly " $fragmentSpreads": FragmentRefs<"QuotaScopeCardFragment" | "QuotaSettingModalFragment">;
  } | null;
  readonly user_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"ResourcePolicyCard_user_resource_policy">;
  } | null;
};
export type StorageHostSettingsPanelQuery = {
  response: StorageHostSettingsPanelQuery$data;
  variables: StorageHostSettingsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project_resource_policy_name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "quota_scope_id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProjectResourcePolicy"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipQuotaScope"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipUserResourcePolicy"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "storage_host_name"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_resource_policy_name"
},
v7 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "project_resource_policy_name"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_size",
  "storageKey": null
},
v9 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "user_resource_policy_name"
  }
],
v10 = [
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
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = [
  (v8/*: any*/),
  (v11/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "created_at",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostSettingsPanelQuery",
    "selections": [
      {
        "condition": "skipProjectResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourcePolicyCard_project_resource_policy"
              }
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipUserResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v9/*: any*/),
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourcePolicyCard_user_resource_policy"
              }
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipQuotaScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "QuotaSettingModalFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "QuotaScopeCardFragment"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageHostSettingsPanelQuery",
    "selections": [
      {
        "condition": "skipProjectResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": (v12/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipUserResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v9/*: any*/),
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": (v12/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipQuotaScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "QuotaScope",
            "kind": "LinkedField",
            "name": "quota_scope",
            "plural": false,
            "selections": [
              (v11/*: any*/),
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
        ]
      }
    ]
  },
  "params": {
    "cacheID": "aa1f27fc178c88b21219a7c716dd1d6e",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingsPanelQuery(\n  $project_resource_policy_name: String!\n  $skipProjectResourcePolicy: Boolean!\n  $user_resource_policy_name: String\n  $skipUserResourcePolicy: Boolean!\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $skipQuotaScope: Boolean!\n) {\n  project_resource_policy(name: $project_resource_policy_name) @skip(if: $skipProjectResourcePolicy) {\n    max_vfolder_size\n    ...ResourcePolicyCard_project_resource_policy\n  }\n  user_resource_policy(name: $user_resource_policy_name) @skip(if: $skipUserResourcePolicy) {\n    max_vfolder_size\n    ...ResourcePolicyCard_user_resource_policy\n  }\n  quota_scope(storage_host_name: $storage_host_name, quota_scope_id: $quota_scope_id) @skip(if: $skipQuotaScope) {\n    ...QuotaSettingModalFragment\n    ...QuotaScopeCardFragment\n  }\n}\n\nfragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n\nfragment QuotaScopeCardFragment on QuotaScope {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n  ...QuotaSettingModalFragment\n}\n\nfragment QuotaSettingModalFragment on QuotaScope {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n}\n\nfragment ResourcePolicyCard_project_resource_policy on ProjectResourcePolicy {\n  id\n  name\n  max_vfolder_size\n  ...ProjectResourcePolicySettingModalFragment\n}\n\nfragment ResourcePolicyCard_user_resource_policy on UserResourcePolicy {\n  id\n  name\n  max_vfolder_size\n  ...UserResourcePolicySettingModalFragment\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n"
  }
};
})();

(node as any).hash = "48491998ccff178a7d2b714b05f49115";

export default node;
