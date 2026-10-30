/**
 * @generated SignedSource<<c722fb437cbfcbfdde291d3391bda063>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type UpdateVFolderV2Input = {
  cloneable?: boolean | null | undefined;
  name?: string | null | undefined;
  permission?: VFolderMountPermission | null | undefined;
};
export type FolderDefaultMountPermissionModalUpdateMutation$variables = {
  input: UpdateVFolderV2Input;
  vfolderId: string;
};
export type FolderDefaultMountPermissionModalUpdateMutation$data = {
  readonly updateVfolderV2: {
    readonly vfolder: {
      readonly accessControl: {
        readonly permission: VFolderMountPermission;
      };
      readonly id: string;
    };
  };
};
export type FolderDefaultMountPermissionModalUpdateMutation = {
  response: FolderDefaultMountPermissionModalUpdateMutation$data;
  variables: FolderDefaultMountPermissionModalUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "UpdateVFolderV2Payload",
    "kind": "LinkedField",
    "name": "updateVfolderV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolder",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderDefaultMountPermissionModalUpdateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FolderDefaultMountPermissionModalUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "4a490ae896f1faba144e165eebd5a88c",
    "id": null,
    "metadata": {},
    "name": "FolderDefaultMountPermissionModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation FolderDefaultMountPermissionModalUpdateMutation(\n  $vfolderId: UUID!\n  $input: UpdateVFolderV2Input!\n) {\n  updateVfolderV2(vfolderId: $vfolderId, input: $input) {\n    vfolder {\n      id\n      accessControl {\n        permission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "64885613b007fcdcc8511544a9e4db67";

export default node;
