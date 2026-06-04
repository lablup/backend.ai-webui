/**
 * @generated SignedSource<<952a852316359de42824efff97db29ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type ProjectStoragePermissionTableQuery$variables = {
  projectIds: ReadonlyArray<string>;
  skip: boolean;
};
export type ProjectStoragePermissionTableQuery$data = {
  readonly adminProjectsV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
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
      };
    }>;
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
    "name": "projectIds"
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
            "fields": [
              {
                "fields": [
                  {
                    "kind": "Variable",
                    "name": "in",
                    "variableName": "projectIds"
                  }
                ],
                "kind": "ObjectValue",
                "name": "id"
              }
            ],
            "kind": "ObjectValue",
            "name": "filter"
          },
          {
            "kind": "Literal",
            "name": "limit",
            "value": 10
          }
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "adminProjectsV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "node",
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
    "cacheID": "dad7d931f435dd173257bc31ba7b790a",
    "id": null,
    "metadata": {},
    "name": "ProjectStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query ProjectStoragePermissionTableQuery(\n  $projectIds: [UUID!]!\n  $skip: Boolean!\n) {\n  adminProjectsV2(filter: {id: {in: $projectIds}}, limit: 10) @skip(if: $skip) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n        storage {\n          allowedVfolderHosts {\n            host\n            permissions\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b73bbef7e6755b0d701c701bfdf01801";

export default node;
