/**
 * @generated SignedSource<<2dba6982cf9185a379a2037b18728cc6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FolderQuotaCardUnsetMutation$variables = {
  quota_scope_id: string;
  storage_host_name: string;
};
export type FolderQuotaCardUnsetMutation$data = {
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
export type FolderQuotaCardUnsetMutation = {
  response: FolderQuotaCardUnsetMutation$data;
  variables: FolderQuotaCardUnsetMutation$variables;
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
    "name": "FolderQuotaCardUnsetMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderQuotaCardUnsetMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9f853cd7ac2499bb658e8348308ac379",
    "id": null,
    "metadata": {},
    "name": "FolderQuotaCardUnsetMutation",
    "operationKind": "mutation",
    "text": "mutation FolderQuotaCardUnsetMutation(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n) {\n  unset_folder_quota(quota_scope_id: $quota_scope_id, storage_host_name: $storage_host_name) {\n    folder_quota {\n      id\n      quota_scope_id\n      storage_host_name\n      details {\n        hard_limit_bytes\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1745abca3cf793cabb5c30239afb1521";

export default node;
