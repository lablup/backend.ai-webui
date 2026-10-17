/**
 * @generated SignedSource<<c195c76ada05785237a0fe1a02d064ce>>
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
};
export type VFolderTableProjectQuery$data = {
  readonly domain: {
    readonly allowed_vfolder_hosts: string | null | undefined;
  } | null | undefined;
  readonly myKeypairResourcePolicyV2: {
    readonly allowedVfolderHosts: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
  readonly projectV2: {
    readonly storage: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
    };
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
  }
],
v1 = {
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
v2 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "group_id"
  }
],
v3 = {
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
v4 = [
  (v3/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectStorageInfo",
  "kind": "LinkedField",
  "name": "storage",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderTableProjectQuery",
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myKeypairResourcePolicyV2",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      }
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
      (v1/*: any*/),
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myKeypairResourcePolicyV2",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c881d5e227efdb6f446414729f6de667",
    "id": null,
    "metadata": {},
    "name": "VFolderTableProjectQuery",
    "operationKind": "query",
    "text": "query VFolderTableProjectQuery(\n  $domain_name: String!\n  $group_id: UUID!\n) {\n  domain(name: $domain_name) {\n    allowed_vfolder_hosts\n  }\n  projectV2(projectId: $group_id) {\n    storage {\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n    id\n  }\n  myKeypairResourcePolicyV2 {\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d6a09b14281c9cdacb9842f10c1132ff";

export default node;
