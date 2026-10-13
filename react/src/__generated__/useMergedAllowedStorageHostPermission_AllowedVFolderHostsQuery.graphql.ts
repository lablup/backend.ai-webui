/**
 * @generated SignedSource<<171054a4fa62f4d89418d8e816e6b5d5>>
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
  readonly myKeypairResourcePolicyV2?: {
    readonly allowedVfolderHosts: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
  readonly projectV2?: {
    readonly storage: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
    };
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
v5 = {
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
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v7 = {
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
v8 = [
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectStorageInfo",
  "kind": "LinkedField",
  "name": "storage",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v10 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "resourcePolicyName"
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
  (v7/*: any*/),
  (v11/*: any*/)
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
      (v5/*: any*/),
      {
        "condition": "skipProjectScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v9/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
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
            "selections": (v8/*: any*/),
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
            "selections": (v8/*: any*/),
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
      (v5/*: any*/),
      {
        "condition": "skipProjectScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              (v11/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
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
            "selections": (v12/*: any*/),
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
            "selections": (v12/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "0976116d0b31549dad811186367b568b",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(\n  $domainName: String\n  $projectId: UUID!\n  $resourcePolicyName: String!\n  $skipProjectScope: Boolean!\n  $isCurrentUser: Boolean!\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  projectV2(projectId: $projectId) @skip(if: $skipProjectScope) {\n    storage {\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n    id\n  }\n  myKeypairResourcePolicyV2 @include(if: $isCurrentUser) {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n  adminKeypairResourcePolicyV2(name: $resourcePolicyName) @skip(if: $isCurrentUser) {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebf8bc793e7ddf0491d8cc4d8ed4678d";

export default node;
