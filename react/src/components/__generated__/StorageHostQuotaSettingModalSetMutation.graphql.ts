/**
 * @generated SignedSource<<452ef89c6c3e4503d77e80c496bdb008>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FolderQuotaInput = {
  hard_limit_bytes?: any | null;
};
export type StorageHostQuotaSettingModalSetMutation$variables = {
  props: FolderQuotaInput;
  quota_scope_id: string;
  storage_host_name: string;
};
export type StorageHostQuotaSettingModalSetMutation$data = {
  readonly set_folder_quota: {
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
export type StorageHostQuotaSettingModalSetMutation = {
  response: StorageHostQuotaSettingModalSetMutation$data;
  variables: StorageHostQuotaSettingModalSetMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "props"
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
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      },
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
    "concreteType": "SetFolderQuota",
    "kind": "LinkedField",
    "name": "set_folder_quota",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostQuotaSettingModalSetMutation",
    "selections": (v3/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageHostQuotaSettingModalSetMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ab695e836f61be95b215880e5469d65b",
    "id": null,
    "metadata": {},
    "name": "StorageHostQuotaSettingModalSetMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostQuotaSettingModalSetMutation(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $props: FolderQuotaInput!\n) {\n  set_folder_quota(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name, props: $props) {\n    folder_quota {\n      id\n      quota_scope_id\n      storage_host_name\n      details {\n        hard_limit_bytes\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9e12dbd002bd6fae8598bc7012b9d0e1";

export default node;
