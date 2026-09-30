/**
 * @generated SignedSource<<5e0ad4892b107ad83489e2e8178e261e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type VFolderTableProjectQuery$variables = {
  domain_name: string;
  group_id: string;
  keypair_resource_policy_name: string;
  supportsResourcePolicyV2: boolean;
};
export type VFolderTableProjectQuery$data = {
  readonly domain: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly group: {
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
export type VFolderTableProjectQuery = {
  response: VFolderTableProjectQuery$data;
  variables: VFolderTableProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "group_id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "keypair_resource_policy_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsResourcePolicyV2"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "allowed_vfolder_hosts",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "name",
      "variableName": "domain_name"
    }
  ],
  "concreteType": "Domain",
  "kind": "LinkedField",
  "name": "domain",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "domain_name",
      "variableName": "domain_name"
    },
    {
      "kind": "Variable",
      "name": "id",
      "variableName": "group_id"
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "group",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
},
v4 = {
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
v5 = {
  "condition": "supportsResourcePolicyV2",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "name",
          "variableName": "keypair_resource_policy_name"
        }
      ],
      "concreteType": "KeyPairResourcePolicy",
      "kind": "LinkedField",
      "name": "keypair_resource_policy",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderTableProjectQuery",
    "selections": [
      (v2/*: any*/),
      (v3/*: any*/),
      {
        "condition": "supportsResourcePolicyV2",
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
            "selections": [
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      (v5/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderTableProjectQuery",
    "selections": [
      (v2/*: any*/),
      (v3/*: any*/),
      {
        "condition": "supportsResourcePolicyV2",
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
            "selections": [
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      },
      (v5/*: any*/)
    ]
  },
  "params": {
    "cacheID": "d5b48ff239276c761eeb49e2a4599c77",
    "id": null,
    "metadata": {},
    "name": "VFolderTableProjectQuery",
    "operationKind": "query",
    "text": "query VFolderTableProjectQuery(\n  $domain_name: String!\n  $group_id: UUID!\n  $keypair_resource_policy_name: String!\n  $supportsResourcePolicyV2: Boolean!\n) {\n  domain(name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  group(id: $group_id, domain_name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  myKeypairResourcePolicyV2 @include(if: $supportsResourcePolicyV2) @since(version: \"26.4.2\") {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n  keypair_resource_policy(name: $keypair_resource_policy_name) @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "bd3bad5de24afbe33bf6298b9d808713";

export default node;
