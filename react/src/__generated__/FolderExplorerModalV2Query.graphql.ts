/**
 * @generated SignedSource<<090df2bb84cddd2bd44470d5437d6f5e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type FolderExplorerModalV2Query$variables = {
  vfolderId: string;
};
export type FolderExplorerModalV2Query$data = {
  readonly vfolderNode: Result<{
    readonly entityId: string;
    readonly host: string;
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly ownership: {
      readonly projectId: string | null | undefined;
    };
    readonly permissions: ReadonlyArray<PermissionBit>;
    readonly unmanagedPath: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderV2Fragment" | "FolderExplorerModalV2OwnershipFragment" | "VFolderNodeDescriptionV2Fragment">;
  } | null | undefined, unknown>;
};
export type FolderExplorerModalV2Query = {
  response: FolderExplorerModalV2Query$data;
  variables: FolderExplorerModalV2Query$variables;
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
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "unmanagedPath",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderExplorerModalV2Query",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "vfolderNode",
          "args": (v1/*: any*/),
          "concreteType": "VFolder",
          "kind": "LinkedField",
          "name": "vfolderV2",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            (v3/*: any*/),
            (v4/*: any*/),
            (v5/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "VFolderMetadataInfo",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": (v7/*: any*/),
              "storageKey": null
            },
            (v8/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "VFolderOwnershipInfo",
              "kind": "LinkedField",
              "name": "ownership",
              "plural": false,
              "selections": [
                (v9/*: any*/)
              ],
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "FolderExplorerModalV2OwnershipFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "FolderExplorerHeaderV2Fragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "VFolderNodeDescriptionV2Fragment"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderExplorerModalV2Query",
    "selections": [
      {
        "alias": "vfolderNode",
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "usageMode",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cloneable",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "quotaScopeId",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderOwnershipInfo",
            "kind": "LinkedField",
            "name": "ownership",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectBasicInfo",
                    "kind": "LinkedField",
                    "name": "basicInfo",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "userId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "creatorId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2BasicInfo",
                    "kind": "LinkedField",
                    "name": "basicInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "email",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
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
                "name": "ownershipType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "permission",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderQuotaInfo",
            "kind": "LinkedField",
            "name": "quota",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "maxFiles",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "BinarySizeInfo",
                "kind": "LinkedField",
                "name": "maxSize",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "expr",
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
  },
  "params": {
    "cacheID": "d83bed40cdd39981a10c13f5d1f60af7",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalV2Query",
    "operationKind": "query",
    "text": "query FolderExplorerModalV2Query(\n  $vfolderId: UUID!\n) {\n  vfolderNode: vfolderV2(vfolderId: $vfolderId) {\n    unmanagedPath\n    host\n    id\n    entityId\n    metadata {\n      name\n    }\n    permissions @since(version: \"26.9.0rc1\")\n    ownership {\n      projectId\n    }\n    ...FolderExplorerModalV2OwnershipFragment\n    ...FolderExplorerHeaderV2Fragment\n    ...VFolderNodeDescriptionV2Fragment\n  }\n}\n\nfragment EditableVFolderNameV2Fragment on VFolder {\n  id\n  entityId\n  status\n  metadata {\n    name\n  }\n  ownership {\n    userId\n    projectId\n  }\n}\n\nfragment FileBrowserButtonV2Fragment on VFolder {\n  id\n  entityId\n  host\n  metadata {\n    name\n  }\n}\n\nfragment FolderExplorerHeaderV2Fragment on VFolder {\n  id\n  unmanagedPath\n  ...VFolderNodeIdenticonV2Fragment\n  ...EditableVFolderNameV2Fragment\n  ...FileBrowserButtonV2Fragment\n  ...SFTPServerButtonV2Fragment\n}\n\nfragment FolderExplorerModalV2OwnershipFragment on VFolder {\n  ownership {\n    projectId\n    project {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n}\n\nfragment SFTPServerButtonV2Fragment on VFolder {\n  id\n  entityId\n  host\n  metadata {\n    name\n  }\n}\n\nfragment VFolderNodeDescriptionV2Fragment on VFolder {\n  id\n  host\n  status\n  unmanagedPath\n  metadata {\n    name\n    usageMode\n    cloneable\n    createdAt\n  }\n  accessControl {\n    ownershipType\n  }\n  quota {\n    maxFiles\n    maxSize {\n      expr @since(version: \"26.8.0\")\n    }\n  }\n  ownership {\n    userId\n    projectId\n    creatorId\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    project {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n  ...VFolderPermissionCellV2Fragment\n  ...useVirtualFolderNodePathV2Fragment\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n\nfragment VFolderPermissionCellV2Fragment on VFolder {\n  accessControl {\n    permission\n  }\n}\n\nfragment useVirtualFolderNodePathV2Fragment on VFolder {\n  id\n  entityId\n  metadata {\n    quotaScopeId\n  }\n}\n"
  }
};
})();

(node as any).hash = "698a7a7d9d30322fb1a7f2fa420fee8e";

export default node;
