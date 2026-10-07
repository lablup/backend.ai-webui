/**
 * @generated SignedSource<<10304d0725697c81a497270875031d04>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$variables = {
  domainName?: string | null | undefined;
  isCurrentUser: boolean;
  projectId: string;
  resourcePolicyName: string;
  skipProjectScope: boolean;
};
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$data = {
  readonly adminKeypairResourcePolicyV2?: {
    readonly allowedVfolderHosts: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
  readonly domain: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly group?: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly myKeypairResourcePolicyV2?: {
    readonly allowedVfolderHosts: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
};
export type useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery = {
  response: useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$data;
  variables: useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isCurrentUser"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourcePolicyName"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProjectScope"
},
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "allowed_vfolder_hosts",
    "storageKey": null
  }
],
v6 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "name",
      "variableName": "domainName"
    }
  ],
  "concreteType": "Domain",
  "kind": "LinkedField",
  "name": "domain",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = {
  "condition": "skipProjectScope",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "domain_name",
          "variableName": "domainName"
        },
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "projectId"
        }
      ],
      "concreteType": "Group",
      "kind": "LinkedField",
      "name": "group",
      "plural": false,
      "selections": (v5/*: any*/),
      "storageKey": null
    }
  ]
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderHostPermissionEntry",
  "kind": "LinkedField",
  "name": "allowedVfolderHosts",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "host",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permissions",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = [
  (v8/*: any*/)
],
v10 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "resourcePolicyName"
  }
],
v11 = [
  (v8/*: any*/),
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
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": [
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "condition": "isCurrentUser",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v9/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCurrentUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "adminKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v9/*: any*/),
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
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": [
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "condition": "isCurrentUser",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v11/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCurrentUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "adminKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v11/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "4777ddc0281f45467e640524d31c377d",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(\n  $domainName: String\n  $projectId: UUID!\n  $resourcePolicyName: String!\n  $skipProjectScope: Boolean!\n  $isCurrentUser: Boolean!\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $skipProjectScope) {\n    allowed_vfolder_hosts\n  }\n  myKeypairResourcePolicyV2 @include(if: $isCurrentUser) {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n  adminKeypairResourcePolicyV2(name: $resourcePolicyName) @skip(if: $isCurrentUser) {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "9618da83356f1380440dc149ee2207f4";

export default node;
