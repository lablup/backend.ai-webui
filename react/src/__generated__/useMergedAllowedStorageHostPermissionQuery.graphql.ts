/**
 * @generated SignedSource<<335d26835025d9216ae532b2ba3f7f51>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type useMergedAllowedStorageHostPermissionQuery$variables = Record<PropertyKey, never>;
export type useMergedAllowedStorageHostPermissionQuery$data = {
  readonly myStorageHostPermissions: {
    readonly items: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
  } | null | undefined;
};
export type useMergedAllowedStorageHostPermissionQuery = {
  response: useMergedAllowedStorageHostPermissionQuery$data;
  variables: useMergedAllowedStorageHostPermissionQuery$variables;
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
    "name": "useMergedAllowedStorageHostPermissionQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermissionQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b7e59755036d6818d45f7be0812be606",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermissionQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermissionQuery {\n  myStorageHostPermissions {\n    items {\n      host\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6dc122d2c992d0943c49d723883ebede";

export default node;
