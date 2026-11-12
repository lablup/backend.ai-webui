/**
 * @generated SignedSource<<83ebc5879b242b58a990255a88cc9125>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type VFolderScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type VFolderFilter = {
  AND?: ReadonlyArray<VFolderFilter> | null | undefined;
  NOT?: ReadonlyArray<VFolderFilter> | null | undefined;
  OR?: ReadonlyArray<VFolderFilter> | null | undefined;
  cloneable?: boolean | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  host?: StringFilter | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  status?: VFolderOperationStatusFilter | null | undefined;
  usageMode?: VFolderUsageModeFilter | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type VFolderOperationStatusFilter = {
  equals?: VFolderOperationStatus | null | undefined;
  in?: ReadonlyArray<VFolderOperationStatus> | null | undefined;
  notEquals?: VFolderOperationStatus | null | undefined;
  notIn?: ReadonlyArray<VFolderOperationStatus> | null | undefined;
};
export type VFolderUsageModeFilter = {
  equals?: VFolderUsageMode | null | undefined;
  in?: ReadonlyArray<VFolderUsageMode> | null | undefined;
  notEquals?: VFolderUsageMode | null | undefined;
  notIn?: ReadonlyArray<VFolderUsageMode> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type EntityLabelNestedFilter = {
  every?: EntityLabelFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: EntityLabelFilter | null | undefined;
  some?: EntityLabelFilter | null | undefined;
};
export type EntityLabelFilter = {
  AND?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  OR?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type VFolderAutoMountScope = {
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type useMountableVFoldersAutoMountedQuery$variables = {
  autoMountScope: VFolderAutoMountScope;
  filter?: VFolderFilter | null | undefined;
  isAutoMountSetting: boolean;
  limit: number;
  scope: VFolderScope;
};
export type useMountableVFoldersAutoMountedQuery$data = {
  readonly scopedVFoldersV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessControl: {
          readonly permission: VFolderMountPermission;
        };
        readonly entityId: string;
        readonly metadata: {
          readonly name: string;
        };
      };
    }>;
  } | null | undefined;
  readonly scopedVfolderAutoMounts?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly mountDestination: string;
        readonly vfolder: {
          readonly host: string;
          readonly metadata: {
            readonly name: string;
          };
          readonly status: VFolderOperationStatus;
        } | null | undefined;
        readonly vfolderId: string;
      };
    }>;
  } | null | undefined;
};
export type useMountableVFoldersAutoMountedQuery = {
  response: useMountableVFoldersAutoMountedQuery$data;
  variables: useMountableVFoldersAutoMountedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoMountScope"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isAutoMountSetting"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v5 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "NAME"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v8 = {
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
},
v9 = {
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
v10 = [
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "MOUNT_DESTINATION"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "autoMountScope"
  }
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useMountableVFoldersAutoMountedQuery",
    "selections": [
      {
        "condition": "isAutoMountSetting",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "VFolderConnection",
            "kind": "LinkedField",
            "name": "scopedVFoldersV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/)
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
      {
        "condition": "isAutoMountSetting",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "VFolderAutoMountConnection",
            "kind": "LinkedField",
            "name": "scopedVfolderAutoMounts",
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
                      (v11/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "VFolder",
                        "kind": "LinkedField",
                        "name": "vfolder",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v9/*: any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "useMountableVFoldersAutoMountedQuery",
    "selections": [
      {
        "condition": "isAutoMountSetting",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "VFolderConnection",
            "kind": "LinkedField",
            "name": "scopedVFoldersV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v15/*: any*/)
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
      {
        "condition": "isAutoMountSetting",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v10/*: any*/),
            "concreteType": "VFolderAutoMountConnection",
            "kind": "LinkedField",
            "name": "scopedVfolderAutoMounts",
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
                      (v11/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "VFolder",
                        "kind": "LinkedField",
                        "name": "vfolder",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v9/*: any*/),
                          (v15/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "1ff6b0d62ced9702f95e4b3d9a4d297f",
    "id": null,
    "metadata": {},
    "name": "useMountableVFoldersAutoMountedQuery",
    "operationKind": "query",
    "text": "query useMountableVFoldersAutoMountedQuery(\n  $scope: VFolderScope!\n  $filter: VFolderFilter\n  $autoMountScope: VFolderAutoMountScope!\n  $limit: Int!\n  $isAutoMountSetting: Boolean!\n) {\n  scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @skip(if: $isAutoMountSetting) {\n    edges {\n      node {\n        entityId\n        accessControl {\n          permission\n        }\n        metadata {\n          name\n        }\n        id\n      }\n    }\n  }\n  scopedVfolderAutoMounts(scope: $autoMountScope, limit: $limit, orderBy: [{field: MOUNT_DESTINATION, direction: ASC}]) @include(if: $isAutoMountSetting) {\n    edges {\n      node {\n        vfolderId\n        mountDestination\n        vfolder {\n          host\n          status\n          metadata {\n            name\n          }\n          id\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c4a1402aaa73d6ace4095f19906dca11";

export default node;
