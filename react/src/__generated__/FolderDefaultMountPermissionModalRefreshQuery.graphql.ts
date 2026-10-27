/**
 * @generated SignedSource<<e55f92ffd77e30273ae65f3901334953>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type FolderDefaultMountPermissionModalRefreshQuery$variables = {
  vfolderId: string;
};
export type FolderDefaultMountPermissionModalRefreshQuery$data = {
  readonly vfolderV2: {
    readonly accessControl: {
      readonly permission: VFolderMountPermission;
    };
    readonly id: string;
  } | null | undefined;
};
export type FolderDefaultMountPermissionModalRefreshQuery = {
  response: FolderDefaultMountPermissionModalRefreshQuery$data;
  variables: FolderDefaultMountPermissionModalRefreshQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
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
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolderAccessControlInfo",
        "kind": "LinkedField",
        "name": "accessControl",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permission",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderDefaultMountPermissionModalRefreshQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderDefaultMountPermissionModalRefreshQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dfdeda56897f3ffbb2c84cf2b6f27e78",
    "id": null,
    "metadata": {},
    "name": "FolderDefaultMountPermissionModalRefreshQuery",
    "operationKind": "query",
    "text": "query FolderDefaultMountPermissionModalRefreshQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    accessControl {\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6fb2f31a8db235c4b567a954077ea2fb";

export default node;
