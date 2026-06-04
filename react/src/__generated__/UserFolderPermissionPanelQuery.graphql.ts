/**
 * @generated SignedSource<<1e6781b6bad581f28cf68f8c9fc73a4a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserFolderPermissionPanelQuery$variables = Record<PropertyKey, never>;
export type UserFolderPermissionPanelQuery$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type UserFolderPermissionPanelQuery = {
  response: UserFolderPermissionPanelQuery$data;
  variables: UserFolderPermissionPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PredefinedAtomicPermission",
    "kind": "LinkedField",
    "name": "vfolder_host_permissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "vfolder_host_permission_list",
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
    "name": "UserFolderPermissionPanelQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserFolderPermissionPanelQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "6b3bfe2330d336a38ea7a5eac3308955",
    "id": null,
    "metadata": {},
    "name": "UserFolderPermissionPanelQuery",
    "operationKind": "query",
    "text": "query UserFolderPermissionPanelQuery {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "9a7479aeeccc58376532d132f0b2713b";

export default node;
