/**
 * @generated SignedSource<<4e52996b9922ecb1517327e02a4ef47b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderAutoMountMetadataSectionTestQuery$variables = {
  vfolderId: string;
};
export type VFolderAutoMountMetadataSectionTestQuery$data = {
  readonly vfolderV2: {
    readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountMetadataSectionFragment">;
  } | null | undefined;
};
export type VFolderAutoMountMetadataSectionTestQuery = {
  response: VFolderAutoMountMetadataSectionTestQuery$data;
  variables: VFolderAutoMountMetadataSectionTestQuery$variables;
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
  "name": "entityId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UUID"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountMetadataSectionTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VFolderAutoMountMetadataSectionFragment"
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
    "name": "VFolderAutoMountMetadataSectionTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
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
                "name": "projectId",
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
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
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
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "limit",
                "value": 1
              }
            ],
            "concreteType": "VFolderAutoMountConnection",
            "kind": "LinkedField",
            "name": "vfolderAutoMounts",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderAutoMountEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolderAutoMount",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "scopeType",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "scopeId",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "mountDestination",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "subpath",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "mountPermission",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "vfolderAutoMounts(limit:1)"
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7d1e63532545a6a628e224e409c4b59f",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "vfolderV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "VFolder"
        },
        "vfolderV2.accessControl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderAccessControlInfo"
        },
        "vfolderV2.accessControl.ownershipType": {
          "enumValues": [
            "USER",
            "GROUP"
          ],
          "nullable": false,
          "plural": false,
          "type": "VFolderOwnershipType"
        },
        "vfolderV2.entityId": (v4/*: any*/),
        "vfolderV2.id": (v5/*: any*/),
        "vfolderV2.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderMetadataInfo"
        },
        "vfolderV2.metadata.name": (v6/*: any*/),
        "vfolderV2.ownership": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderOwnershipInfo"
        },
        "vfolderV2.ownership.creatorId": (v7/*: any*/),
        "vfolderV2.ownership.project": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2"
        },
        "vfolderV2.ownership.project.basicInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectBasicInfo"
        },
        "vfolderV2.ownership.project.basicInfo.type": {
          "enumValues": [
            "GENERAL",
            "MODEL_STORE",
            "PERSONAL"
          ],
          "nullable": false,
          "plural": false,
          "type": "ProjectTypeV2"
        },
        "vfolderV2.ownership.project.id": (v5/*: any*/),
        "vfolderV2.ownership.projectId": (v7/*: any*/),
        "vfolderV2.ownership.userId": (v7/*: any*/),
        "vfolderV2.vfolderAutoMounts": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "VFolderAutoMountConnection"
        },
        "vfolderV2.vfolderAutoMounts.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "VFolderAutoMountEdge"
        },
        "vfolderV2.vfolderAutoMounts.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderAutoMount"
        },
        "vfolderV2.vfolderAutoMounts.edges.node.entityId": (v4/*: any*/),
        "vfolderV2.vfolderAutoMounts.edges.node.id": (v5/*: any*/),
        "vfolderV2.vfolderAutoMounts.edges.node.mountDestination": (v6/*: any*/),
        "vfolderV2.vfolderAutoMounts.edges.node.mountPermission": {
          "enumValues": [
            "READ_ONLY",
            "READ_WRITE",
            "RW_DELETE"
          ],
          "nullable": false,
          "plural": false,
          "type": "MountPermission"
        },
        "vfolderV2.vfolderAutoMounts.edges.node.scopeId": (v4/*: any*/),
        "vfolderV2.vfolderAutoMounts.edges.node.scopeType": {
          "enumValues": [
            "PROJECT",
            "USER"
          ],
          "nullable": false,
          "plural": false,
          "type": "VFolderAutoMountScopeType"
        },
        "vfolderV2.vfolderAutoMounts.edges.node.subpath": (v6/*: any*/)
      }
    },
    "name": "VFolderAutoMountMetadataSectionTestQuery",
    "operationKind": "query",
    "text": "query VFolderAutoMountMetadataSectionTestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...VFolderAutoMountMetadataSectionFragment\n    id\n  }\n}\n\nfragment VFolderAutoMountMetadataSectionFragment on VFolder {\n  entityId\n  metadata {\n    name\n  }\n  accessControl {\n    ownershipType\n  }\n  ownership {\n    userId\n    projectId\n    creatorId\n    project {\n      basicInfo {\n        type\n      }\n      id\n    }\n  }\n  ...VFolderNodesV2AutoMountCellFragment\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  mountDestination\n  subpath\n  mountPermission\n}\n\nfragment VFolderNodesV2AutoMountCellFragment on VFolder {\n  vfolderAutoMounts(limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n        scopeType\n        scopeId\n        mountDestination\n        subpath\n        mountPermission\n        ...VFolderAutoMountSettingModalFragment\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e48a7ae57f9c3f3d2e6fcaba86fd4240";

export default node;
