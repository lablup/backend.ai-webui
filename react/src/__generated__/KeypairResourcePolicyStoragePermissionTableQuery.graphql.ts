/**
 * @generated SignedSource<<5416d7204087d3f2a5c783810af00259>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type KeypairResourcePolicyStoragePermissionTableQuery$variables = {
  name: string;
  skip: boolean;
};
export type KeypairResourcePolicyStoragePermissionTableQuery$data = {
  readonly adminKeypairResourcePolicyV2?: {
    readonly allowedVfolderHosts: ReadonlyArray<{
      readonly host: string;
      readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
};
export type KeypairResourcePolicyStoragePermissionTableQuery = {
  response: KeypairResourcePolicyStoragePermissionTableQuery$data;
  variables: KeypairResourcePolicyStoragePermissionTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "name",
            "variableName": "name"
          }
        ],
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePolicyV2",
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
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderHostPermissionEntry",
            "kind": "LinkedField",
            "name": "allowedVfolderHosts",
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fb14f1ec5edee501c698e38774bb468f",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query KeypairResourcePolicyStoragePermissionTableQuery(\n  $name: String!\n  $skip: Boolean!\n) {\n  adminKeypairResourcePolicyV2(name: $name) @skip(if: $skip) {\n    id\n    name\n    allowedVfolderHosts {\n      host\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "df868120b7ee3a3d59bae835b1c07802";

export default node;
