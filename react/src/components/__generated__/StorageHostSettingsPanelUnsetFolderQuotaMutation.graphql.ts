/**
 * @generated SignedSource<<fd731c787c947f37e3012497d7719467>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type StorageHostSettingsPanelUnsetFolderQuotaMutation$variables = {
  quota_scope_id: string;
  storage_host_name: string;
};
export type StorageHostSettingsPanelUnsetFolderQuotaMutation$data = {
  readonly unset_folder_quota: {
    readonly folder_quota: {
      readonly details: {
        readonly hard_limit_bytes: any | null;
      };
      readonly id: any;
      readonly quota_scope_id: string;
      readonly storage_host_name: string;
    } | null;
  } | null;
};
export type StorageHostSettingsPanelUnsetFolderQuotaMutation = {
  response: StorageHostSettingsPanelUnsetFolderQuotaMutation$data;
  variables: StorageHostSettingsPanelUnsetFolderQuotaMutation$variables;
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
    "concreteType": "UnsetFolderQuota",
    "kind": "LinkedField",
    "name": "unset_folder_quota",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
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
    "name": "StorageHostSettingsPanelUnsetFolderQuotaMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostSettingsPanelUnsetFolderQuotaMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f696c6f1f6cf5d4326c0f6d4de2e6a55",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelUnsetFolderQuotaMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostSettingsPanelUnsetFolderQuotaMutation(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n) {\n  unset_folder_quota(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name) {\n    folder_quota {\n      id\n      quota_scope_id\n      storage_host_name\n      details {\n        hard_limit_bytes\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c70db27035802a251a31324d8ffecffd";

export default node;
