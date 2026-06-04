/**
 * @generated SignedSource<<ca4c7aca32a3e6c5677d44e900e8eb32>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type ProjectStoragePermissionTableQuery$variables = {
  projectId: string;
  skip: boolean;
};
export type ProjectStoragePermissionTableQuery$data = {
  readonly projectV2?: {
    readonly basicInfo: {
      readonly name: string;
    };
    readonly id: string;
    readonly storage: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
    };
  } | null | undefined;
};
export type ProjectStoragePermissionTableQuery = {
  response: ProjectStoragePermissionTableQuery$data;
  variables: ProjectStoragePermissionTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
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
            "name": "projectId",
            "variableName": "projectId"
          }
        ],
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
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
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectStorageInfo",
            "kind": "LinkedField",
            "name": "storage",
            "plural": false,
            "selections": [
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
    "name": "ProjectStoragePermissionTableQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectStoragePermissionTableQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "90150490a11879d49fbe0975f8876189",
    "id": null,
    "metadata": {},
    "name": "ProjectStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query ProjectStoragePermissionTableQuery(\n  $projectId: UUID!\n  $skip: Boolean!\n) {\n  projectV2(projectId: $projectId) @skip(if: $skip) {\n    id\n    basicInfo {\n      name\n    }\n    storage {\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e14638f215f4e4fc0fc4091b964520ad";

export default node;
