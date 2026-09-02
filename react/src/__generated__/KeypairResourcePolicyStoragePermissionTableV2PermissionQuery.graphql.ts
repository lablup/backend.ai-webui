/**
 * @generated SignedSource<<6b4cd99419ed9d73150fe042e08ebf34>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyStoragePermissionTableV2PermissionQuery$variables = Record<PropertyKey, never>;
export type KeypairResourcePolicyStoragePermissionTableV2PermissionQuery$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type KeypairResourcePolicyStoragePermissionTableV2PermissionQuery = {
  response: KeypairResourcePolicyStoragePermissionTableV2PermissionQuery$data;
  variables: KeypairResourcePolicyStoragePermissionTableV2PermissionQuery$variables;
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
    "name": "KeypairResourcePolicyStoragePermissionTableV2PermissionQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableV2PermissionQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "4edaa19a497ba3832c7bafaccd5b633e",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableV2PermissionQuery",
    "operationKind": "query",
    "text": "query KeypairResourcePolicyStoragePermissionTableV2PermissionQuery {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "ff25b5aaf2741525ef9a488c3c27e5f3";

export default node;
