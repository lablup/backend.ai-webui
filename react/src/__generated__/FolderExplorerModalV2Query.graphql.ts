/**
 * @generated SignedSource<<1bbaef17f80c17a6d6f88fb5468cfc67>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerModalV2Query$variables = {
  vfolderGlobalId: string;
  vfolderId: string;
};
export type FolderExplorerModalV2Query$data = {
  readonly legacyVFolderNode: {
    readonly host: string | null | undefined;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
    readonly unmanaged_path: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderFragment">;
  } | null | undefined;
  readonly vfolderNode: {
    readonly host: string;
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly ownership: {
      readonly project: {
        readonly basicInfo: {
          readonly name: string;
        };
      } | null | undefined;
      readonly projectId: string | null | undefined;
    };
    readonly unmanagedPath: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderV2Fragment" | "VFolderNodeDescriptionV2Fragment">;
  } | null | undefined;
};
export type FolderExplorerModalV2Query = {
  response: FolderExplorerModalV2Query$data;
  variables: FolderExplorerModalV2Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderGlobalId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "vfolderGlobalId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "unmanaged_path",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v8 = [
  {
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "unmanagedPath",
  "storageKey": null
},
v10 = [
  (v4/*: any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permission",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderExplorerModalV2Query",
    "selections": [
      {
        "alias": "legacyVFolderNode",
        "args": (v2/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FolderExplorerHeaderFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": "vfolderNode",
        "args": (v8/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v5/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": (v10/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderOwnershipInfo",
            "kind": "LinkedField",
            "name": "ownership",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v12/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FolderExplorerModalV2Query",
    "selections": [
      {
        "alias": "legacyVFolderNode",
        "args": (v2/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "user",
            "storageKey": null
          },
          (v13/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "group",
            "storageKey": null
          },
          (v14/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "vfolderNode",
        "args": (v8/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v5/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              (v4/*: any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderOwnershipInfo",
            "kind": "LinkedField",
            "name": "ownership",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v12/*: any*/),
                  (v3/*: any*/)
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
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v14/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderAccessControlInfo",
            "kind": "LinkedField",
            "name": "accessControl",
            "plural": false,
            "selections": [
              (v13/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "ownershipType",
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
    "cacheID": "36c31076b05fe504dfb20eb95e3d64db",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalV2Query",
    "operationKind": "query",
    "text": "query FolderExplorerModalV2Query(\n  $vfolderId: UUID!\n  $vfolderGlobalId: String!\n) {\n  legacyVFolderNode: vfolder_node(id: $vfolderGlobalId) {\n    id\n    name\n    host\n    unmanaged_path\n    permissions\n    ...FolderExplorerHeaderFragment\n  }\n  vfolderNode: vfolderV2(vfolderId: $vfolderId) {\n    unmanagedPath\n    host\n    id\n    metadata {\n      name\n    }\n    ownership {\n      projectId\n      project {\n        basicInfo {\n          name\n        }\n        id\n      }\n    }\n    ...FolderExplorerHeaderV2Fragment\n    ...VFolderNodeDescriptionV2Fragment\n  }\n}\n\nfragment EditableVFolderNameFragment on VirtualFolderNode {\n  id\n  name\n  user\n  group\n  status\n}\n\nfragment EditableVFolderNameV2Fragment on VFolder {\n  id\n  status\n  metadata {\n    name\n  }\n  ownership {\n    userId\n    projectId\n  }\n}\n\nfragment FileBrowserButtonFragment on VirtualFolderNode {\n  id\n  host\n  name\n}\n\nfragment FileBrowserButtonV2Fragment on VFolder {\n  id\n  host\n  metadata {\n    name\n  }\n}\n\nfragment FolderExplorerHeaderFragment on VirtualFolderNode {\n  id\n  user\n  permission\n  unmanaged_path @since(version: \"25.04.0\")\n  ...VFolderNameTitleNodeFragment\n  ...VFolderNodeIdenticonFragment\n  ...EditableVFolderNameFragment\n  ...FileBrowserButtonFragment\n  ...SFTPServerButtonFragment\n}\n\nfragment FolderExplorerHeaderV2Fragment on VFolder {\n  id\n  unmanagedPath\n  ...VFolderNodeIdenticonV2Fragment\n  ...EditableVFolderNameV2Fragment\n  ...FileBrowserButtonV2Fragment\n  ...SFTPServerButtonV2Fragment\n}\n\nfragment SFTPServerButtonFragment on VirtualFolderNode {\n  id\n  host\n  name\n}\n\nfragment SFTPServerButtonV2Fragment on VFolder {\n  id\n  host\n  metadata {\n    name\n  }\n}\n\nfragment VFolderNameTitleNodeFragment on VirtualFolderNode {\n  name\n}\n\nfragment VFolderNodeDescriptionV2Fragment on VFolder {\n  id\n  host\n  status\n  unmanagedPath\n  metadata {\n    name\n    usageMode\n    cloneable\n    createdAt\n  }\n  accessControl {\n    permission\n    ownershipType\n  }\n  ownership {\n    userId\n    projectId\n    creatorId\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    project {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n  ...VFolderPermissionCellV2Fragment\n  ...useVirtualFolderNodePathV2Fragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n\nfragment VFolderPermissionCellV2Fragment on VFolder {\n  accessControl {\n    permission\n    ownershipType\n  }\n  ownership {\n    userId\n  }\n}\n\nfragment useVirtualFolderNodePathV2Fragment on VFolder {\n  id\n  metadata {\n    quotaScopeId\n  }\n}\n"
  }
};
})();

(node as any).hash = "9ceb42aa2a4d6fa2c36dd2327d7566b0";

export default node;
