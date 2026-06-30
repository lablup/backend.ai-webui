/**
 * @generated SignedSource<<43a8bbf9ea64e2e34e2406cea7067dcf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type useMountableVFolderHostsQuery$variables = Record<PropertyKey, never>;
export type useMountableVFolderHostsQuery$data = {
  readonly myStorageHostPermissions: {
    readonly items: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
};
export type useMountableVFolderHostsQuery = {
  response: useMountableVFolderHostsQuery$data;
  variables: useMountableVFolderHostsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useMountableVFolderHostsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useMountableVFolderHostsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "5acbee4bf4cfab612d4cf4947fb955e6",
    "id": null,
    "metadata": {},
    "name": "useMountableVFolderHostsQuery",
    "operationKind": "query",
    "text": "query useMountableVFolderHostsQuery {\n  myStorageHostPermissions {\n    items {\n      host\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9316f9cb9510eea07cb926c473a2c556";

export default node;
