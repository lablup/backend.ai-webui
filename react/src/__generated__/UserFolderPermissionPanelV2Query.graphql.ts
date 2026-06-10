/**
 * @generated SignedSource<<09fda6bf1a1c79222470ff2e4561fad1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserFolderPermissionPanelV2Query$variables = Record<PropertyKey, never>;
export type UserFolderPermissionPanelV2Query$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type UserFolderPermissionPanelV2Query = {
  response: UserFolderPermissionPanelV2Query$data;
  variables: UserFolderPermissionPanelV2Query$variables;
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
    "name": "UserFolderPermissionPanelV2Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserFolderPermissionPanelV2Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b620b967747dff34642dac97556e8411",
    "id": null,
    "metadata": {},
    "name": "UserFolderPermissionPanelV2Query",
    "operationKind": "query",
    "text": "query UserFolderPermissionPanelV2Query {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "e9600f0bd2a7da899f9bafd463be4577";

export default node;
