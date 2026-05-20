/**
 * @generated SignedSource<<52e31f44eeac3b5270a5bd020e292043>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderNodeDescriptionV2PermissionRefreshQuery$variables = {
  vfolderId: string;
};
export type VFolderNodeDescriptionV2PermissionRefreshQuery$data = {
  readonly vfolderV2: {
    readonly accessControl: {
      readonly permission: VFolderMountPermission;
    };
    readonly id: string;
  } | null | undefined;
};
export type VFolderNodeDescriptionV2PermissionRefreshQuery = {
  response: VFolderNodeDescriptionV2PermissionRefreshQuery$data;
  variables: VFolderNodeDescriptionV2PermissionRefreshQuery$variables;
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
    "name": "VFolderNodeDescriptionV2PermissionRefreshQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderNodeDescriptionV2PermissionRefreshQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9f379e3964c93287ed58f4d0853e1e71",
    "id": null,
    "metadata": {},
    "name": "VFolderNodeDescriptionV2PermissionRefreshQuery",
    "operationKind": "query",
    "text": "query VFolderNodeDescriptionV2PermissionRefreshQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    accessControl {\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "942a189557b6595abe36788f36464c89";

export default node;
