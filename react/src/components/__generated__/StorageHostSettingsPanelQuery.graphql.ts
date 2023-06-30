/**
 * @generated SignedSource<<619391689daaa60de177f751b922c599>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type StorageHostSettingsPanelQuery$variables = {
  project_name: string;
  quota_scope_id: string;
  storage_host_name: string;
  user_name?: string | null;
};
export type StorageHostSettingsPanelQuery$data = {
  readonly folder_quota: {
    readonly details: {
      readonly hard_limit_bytes: any | null;
      readonly usage_bytes: any | null;
      readonly usage_count: any | null;
    };
    readonly id: any;
    readonly quota_scope_id: string;
    readonly storage_host_name: string;
  } | null;
  readonly project_resource_policy: {
    readonly max_vfolder_size: any | null;
  } | null;
  readonly user_resource_policy: {
    readonly max_vfolder_size: any | null;
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
  "name": "project_name"
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
  "name": "user_name"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "max_vfolder_size",
    "storageKey": null
  }
],
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "project_name"
      }
    ],
    "concreteType": "ProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "project_resource_policy",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "user_name"
      }
    ],
    "concreteType": "UserResourcePolicy",
    "kind": "LinkedField",
    "name": "user_resource_policy",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
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
    "concreteType": "FolderQuota",
    "kind": "LinkedField",
    "name": "folder_quota",
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
          },
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
            "name": "usage_count",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostSettingsPanelQuery",
    "selections": (v5/*: any*/),
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
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "b8cea667caa598452029ddddfc9aa5f9",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingsPanelQuery(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $project_name: String!\n  $user_name: String\n) {\n  project_resource_policy(name: $project_name) {\n    max_vfolder_size\n  }\n  user_resource_policy(name: $user_name) {\n    max_vfolder_size\n  }\n  folder_quota(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name) {\n    id\n    quota_scope_id\n    storage_host_name\n    details {\n      hard_limit_bytes\n      usage_bytes\n      usage_count\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "17a7c402d4057ed93d4542dea6a62802";

export default node;
