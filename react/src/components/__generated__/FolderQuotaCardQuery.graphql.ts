/**
 * @generated SignedSource<<87c27094aedb27dafaa6da9f2450db5f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderQuotaCardQuery$variables = {
  quota_scope_id: string;
  skipFolderQuota: boolean;
  storage_host_name: string;
};
export type FolderQuotaCardQuery$data = {
  readonly folder_quota?: {
    readonly details: {
      readonly hard_limit_bytes: any | null;
    };
    readonly id: any;
    readonly quota_scope_id: string;
    readonly storage_host_name: string;
    readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
  } | null;
};
export type FolderQuotaCardQuery = {
  response: FolderQuotaCardQuery$data;
  variables: FolderQuotaCardQuery$variables;
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
  "name": "skipFolderQuota"
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
    "name": "FolderQuotaCardQuery",
    "selections": [
      {
        "condition": "skipFolderQuota",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "FolderQuota",
            "kind": "LinkedField",
            "name": "folder_quota",
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
    "type": "Queries",
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
    "name": "FolderQuotaCardQuery",
    "selections": [
      {
        "condition": "skipFolderQuota",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "FolderQuota",
            "kind": "LinkedField",
            "name": "folder_quota",
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
    "cacheID": "0b3502733cfc8f015522e306fb6b6f13",
    "id": null,
    "metadata": {},
    "name": "FolderQuotaCardQuery",
    "operationKind": "query",
    "text": "query FolderQuotaCardQuery(\n  $quota_scope_id: String!\n  $storage_host_name: String!\n  $skipFolderQuota: Boolean!\n) {\n  folder_quota(storage_host_name: $storage_host_name, quota_scope_id: $quota_scope_id) @skip(if: $skipFolderQuota) {\n    id\n    quota_scope_id\n    storage_host_name\n    details {\n      hard_limit_bytes\n    }\n    ...QuotaSettingModalFragment\n  }\n}\n\nfragment QuotaSettingModalFragment on FolderQuota {\n  id\n  quota_scope_id\n  storage_host_name\n  details {\n    hard_limit_bytes\n  }\n}\n"
  }
};
})();

(node as any).hash = "721302be1a3a25f049b64d65df250202";

export default node;
