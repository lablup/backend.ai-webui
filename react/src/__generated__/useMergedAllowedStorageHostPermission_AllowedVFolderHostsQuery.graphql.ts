/**
 * @generated SignedSource<<f20601b0e32ba9c07fcb481722b0cf93>>
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
  projectId: string;
  resourcePolicyName: string;
  skipProjectScope: boolean;
  supportsResourcePolicyV2: boolean;
  useAdminPolicyV2: boolean;
  useMyPolicyV2: boolean;
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
  readonly keypair_resource_policy?: {
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
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourcePolicyName"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProjectScope"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsResourcePolicyV2"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useAdminPolicyV2"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useMyPolicyV2"
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "allowed_vfolder_hosts",
    "storageKey": null
  }
],
v8 = {
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
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
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
      "selections": (v7/*: any*/),
      "storageKey": null
    }
  ]
},
v10 = {
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
v11 = [
  (v10/*: any*/)
],
v12 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "resourcePolicyName"
  }
],
v13 = {
  "condition": "supportsResourcePolicyV2",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
    {
      "alias": null,
      "args": (v12/*: any*/),
      "concreteType": "KeyPairResourcePolicy",
      "kind": "LinkedField",
      "name": "keypair_resource_policy",
      "plural": false,
      "selections": (v7/*: any*/),
      "storageKey": null
    }
  ]
},
v14 = [
  (v10/*: any*/),
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
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": [
      (v8/*: any*/),
      (v9/*: any*/),
      {
        "condition": "useMyPolicyV2",
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
        "condition": "useAdminPolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v12/*: any*/),
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "adminKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v11/*: any*/),
            "storageKey": null
          }
        ]
      },
      (v13/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v6/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "selections": [
      (v8/*: any*/),
      (v9/*: any*/),
      {
        "condition": "useMyPolicyV2",
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
            "selections": (v14/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "useAdminPolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v12/*: any*/),
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "adminKeypairResourcePolicyV2",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          }
        ]
      },
      (v13/*: any*/)
    ]
  },
  "params": {
    "cacheID": "4fe50e7b2abd6e252e39edb47a70822d",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(\n  $domainName: String\n  $projectId: UUID!\n  $resourcePolicyName: String!\n  $skipProjectScope: Boolean!\n  $useMyPolicyV2: Boolean!\n  $useAdminPolicyV2: Boolean!\n  $supportsResourcePolicyV2: Boolean!\n) {\n  domain(name: $domainName) {\n    allowed_vfolder_hosts\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $skipProjectScope) {\n    allowed_vfolder_hosts\n  }\n  myKeypairResourcePolicyV2 @include(if: $useMyPolicyV2) @since(version: \"26.4.2\") {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n  adminKeypairResourcePolicyV2(name: $resourcePolicyName) @include(if: $useAdminPolicyV2) @since(version: \"26.4.2\") {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n  keypair_resource_policy(name: $resourcePolicyName) @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "da990358736da5d287663ad7deac61d8";

export default node;
