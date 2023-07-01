/**
 * @generated SignedSource<<4bc8100c8c62f372d4ffa299f4581b41>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingsPanelQuery$variables = {
  project_resource_policy: string;
  quota_scope_id: string;
  skipFolderQuota: boolean;
  skipProjectResourcePolicy: boolean;
  skipUserResourcePolicy: boolean;
  storage_host_name: string;
  user_resource_policy?: string | null;
};
export type StorageHostSettingsPanelQuery$data = {
  readonly folder_quota?: {
    readonly details: {
      readonly hard_limit_bytes: any | null;
    };
    readonly id: any;
    readonly quota_scope_id: string;
    readonly storage_host_name: string;
    readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
  } | null;
  readonly project_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
  } | null;
  readonly user_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
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
  "name": "project_resource_policy"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "quota_scope_id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipFolderQuota"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProjectResourcePolicy"
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
  "name": "user_resource_policy"
},
v7 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "project_resource_policy"
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
    "variableName": "user_resource_policy"
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quota_scope_id",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "storage_host_name",
  "storageKey": null
},
v14 = {
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
},
v15 = [
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
                "name": "ProjectResourcePolicySettingModalFragment"
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
                "name": "UserResourcePolicySettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipFolderQuota",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "FolderQuota",
            "kind": "LinkedField",
            "name": "folder_quota",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
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
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v6/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/)
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
            "selections": (v15/*: any*/),
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
            "selections": (v15/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipFolderQuota",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "FolderQuota",
            "kind": "LinkedField",
            "name": "folder_quota",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "dfb0cf1b0b41c8385cf3a136337d3de9",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingsPanelQuery(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $project_resource_policy: String!\n  $user_resource_policy: String\n  $skipProjectResourcePolicy: Boolean!\n  $skipUserResourcePolicy: Boolean!\n  $skipFolderQuota: Boolean!\n) {\n  project_resource_policy(name: $project_resource_policy) @skip(if: $skipProjectResourcePolicy) {\n    max_vfolder_size\n    ...ProjectResourcePolicySettingModalFragment\n  }\n  user_resource_policy(name: $user_resource_policy) @skip(if: $skipUserResourcePolicy) {\n    max_vfolder_size\n    ...UserResourcePolicySettingModalFragment\n  }\n  folder_quota(storage_host_name: $storage_host_name, quota_scope_id: $quota_scope_id) @skip(if: $skipFolderQuota) {\n    id\n    quota_scope_id\n    storage_host_name\n    details {\n      hard_limit_bytes\n    }\n    ...QuotaSettingModalFragment\n  }\n}\n\nfragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n\nfragment QuotaSettingModalFragment on FolderQuota {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n"
  }
};
})();

(node as any).hash = "db240c2cd1a7a5d846a16996b82b5e17";

export default node;
