/**
 * @generated SignedSource<<2d8a5bfd6f1c8668bccc3871bd8ee023>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StorageHostPermissionPanelQuery$variables = Record<PropertyKey, never>;
export type StorageHostPermissionPanelQuery$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type StorageHostPermissionPanelQuery = {
  response: StorageHostPermissionPanelQuery$data;
  variables: StorageHostPermissionPanelQuery$variables;
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
    "name": "StorageHostPermissionPanelQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "StorageHostPermissionPanelQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "cd9edd6dd9e26ef46ca51ccedbc8d1f6",
    "id": null,
    "metadata": {},
    "name": "StorageHostPermissionPanelQuery",
    "operationKind": "query",
    "text": "query StorageHostPermissionPanelQuery {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc907aefd3a9a8a71b286ecb647fcf9d";

export default node;
