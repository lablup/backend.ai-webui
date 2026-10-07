/**
 * @generated SignedSource<<9c5ac1a5aea090438cbb35eafaa8f06e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type BAIDirectoryPickerModalQuery$variables = {
  vfolderId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
  readonly myStorageHostPermissions: {
    readonly items: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
  readonly vfolderV2: {
    readonly host: string;
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly permissions: ReadonlyArray<PermissionBit>;
  } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
  response: BAIDirectoryPickerModalQuery$data;
  variables: BAIDirectoryPickerModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "VFolder",
    "kind": "LinkedField",
    "name": "vfolderV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolderMetadataInfo",
        "kind": "LinkedField",
        "name": "metadata",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "MyStorageHostPermissionsPayload",
    "kind": "LinkedField",
    "name": "myStorageHostPermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "StorageHostPermission",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/)
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
    "name": "BAIDirectoryPickerModalQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDirectoryPickerModalQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "42fda83f2f3af22f25f40692e1febd41",
    "id": null,
    "metadata": {},
    "name": "BAIDirectoryPickerModalQuery",
    "operationKind": "query",
    "text": "query BAIDirectoryPickerModalQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    host\n    metadata {\n      name\n    }\n    permissions @since(version: \"26.9.0rc1\")\n  }\n  myStorageHostPermissions {\n    items {\n      host\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ae80bf60652036ffcbab2ab0e982aad";

export default node;
