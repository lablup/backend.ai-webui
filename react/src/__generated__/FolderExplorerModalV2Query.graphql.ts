/**
 * @generated SignedSource<<4cdc1fafd49e59bd654336f967435926>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerModalV2Query$variables = {
  vfolderId: string;
};
export type FolderExplorerModalV2Query$data = {
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
  "name": "name",
  "storageKey": null
},
v6 = [
  (v5/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v6/*: any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": (v6/*: any*/),
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
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v8/*: any*/)
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
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              (v5/*: any*/),
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
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
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
                "name": "permission",
                "storageKey": null
              },
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
    "cacheID": "1262a01b36f437256e32ded119856058",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalV2Query",
    "operationKind": "query",
    "text": "query FolderExplorerModalV2Query(\n  $vfolderId: UUID!\n) {\n  vfolderNode: vfolderV2(vfolderId: $vfolderId) {\n    unmanagedPath\n    host\n    id\n    metadata {\n      name\n    }\n    ownership {\n      projectId\n      project {\n        basicInfo {\n          name\n        }\n        id\n      }\n    }\n    ...FolderExplorerHeaderV2Fragment\n    ...VFolderNodeDescriptionV2Fragment\n  }\n}\n\nfragment EditableVFolderNameV2Fragment on VFolder {\n  id\n  status\n  metadata {\n    name\n  }\n  ownership {\n    userId\n    projectId\n  }\n}\n\nfragment FileBrowserButtonV2Fragment on VFolder {\n  id\n  host\n}\n\nfragment FolderExplorerHeaderV2Fragment on VFolder {\n  id\n  unmanagedPath\n  ...VFolderNodeIdenticonV2Fragment\n  ...EditableVFolderNameV2Fragment\n  ...FileBrowserButtonV2Fragment\n  ...SFTPServerButtonV2Fragment\n}\n\nfragment SFTPServerButtonV2Fragment on VFolder {\n  id\n  host\n}\n\nfragment VFolderNodeDescriptionV2Fragment on VFolder {\n  id\n  host\n  status\n  unmanagedPath\n  metadata {\n    name\n    usageMode\n    cloneable\n    createdAt\n  }\n  accessControl {\n    permission\n    ownershipType\n  }\n  ownership {\n    userId\n    projectId\n    creatorId\n    user {\n      basicInfo {\n        email\n      }\n      id\n    }\n    project {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n  ...VFolderPermissionCellV2Fragment\n  ...useVirtualFolderNodePathV2Fragment\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n\nfragment VFolderPermissionCellV2Fragment on VFolder {\n  accessControl {\n    permission\n  }\n}\n\nfragment useVirtualFolderNodePathV2Fragment on VFolder {\n  id\n  metadata {\n    quotaScopeId\n  }\n}\n"
  }
};
})();

(node as any).hash = "61e4efe56e6e90cc4772aab3c2c781b2";

export default node;
