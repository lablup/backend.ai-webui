/**
 * @generated SignedSource<<c95a46aa2e6beb08614d989a74028847>>
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
  storage_host_name: string;
  user_resource_policy?: string | null;
};
export type StorageHostSettingsPanelQuery$data = {
  readonly folder_quota: {
    readonly details: {
      readonly hard_limit_bytes: any | null;
    };
    readonly id: any;
    readonly quota_scope_id: string;
    readonly storage_host_name: string;
    readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
  } | null;
  readonly project_resource_policy: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
  } | null;
  readonly user_resource_policy: {
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
  "name": "storage_host_name"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_resource_policy"
},
v4 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "project_resource_policy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_size",
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "user_resource_policy"
  }
],
v7 = [
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quota_scope_id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "storage_host_name",
  "storageKey": null
},
v11 = {
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
v12 = [
  (v5/*: any*/),
  (v8/*: any*/),
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
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostSettingsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ProjectResourcePolicySettingModalFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserResourcePolicySettingModalFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "FolderQuota",
        "kind": "LinkedField",
        "name": "folder_quota",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "QuotaSettingModalFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageHostSettingsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "FolderQuota",
        "kind": "LinkedField",
        "name": "folder_quota",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1586771dbc6e03583f35053f18b2294a",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingsPanelQuery(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $project_resource_policy: String!\n  $user_resource_policy: String\n) {\n  project_resource_policy(name: $project_resource_policy) {\n    max_vfolder_size\n    ...ProjectResourcePolicySettingModalFragment\n  }\n  user_resource_policy(name: $user_resource_policy) {\n    max_vfolder_size\n    ...UserResourcePolicySettingModalFragment\n  }\n  folder_quota(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name) {\n    id\n    quota_scope_id\n    storage_host_name\n    details {\n      hard_limit_bytes\n    }\n    ...QuotaSettingModalFragment\n  }\n}\n\nfragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n\nfragment QuotaSettingModalFragment on FolderQuota {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n"
  }
};
})();

(node as any).hash = "07d4beba22dca764d2e71d105176ccc0";

export default node;
