/**
 * @generated SignedSource<<2f44a402d1aeef679d49da12f285c86e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScopeType = "PROJECT" | "USER" | "%future added value";
export type VFolderAutoMountScope = {
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type VFolderAutoMountFilter = {
  AND?: ReadonlyArray<VFolderAutoMountFilter> | null | undefined;
  NOT?: ReadonlyArray<VFolderAutoMountFilter> | null | undefined;
  OR?: ReadonlyArray<VFolderAutoMountFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  deletedAt?: NullableDateTimeFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  mountDestination?: StringFilter | null | undefined;
  mountPermission?: VFolderAutoMountPermissionFilter | null | undefined;
  scopeId?: UUIDFilter | null | undefined;
  scopeType?: VFolderAutoMountScopeTypeFilter | null | undefined;
  updatedAt?: DateTimeFilter | null | undefined;
  vfolderId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type VFolderAutoMountScopeTypeFilter = {
  equals?: VFolderAutoMountScopeType | null | undefined;
  in?: ReadonlyArray<VFolderAutoMountScopeType> | null | undefined;
  notEquals?: VFolderAutoMountScopeType | null | undefined;
  notIn?: ReadonlyArray<VFolderAutoMountScopeType> | null | undefined;
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
export type VFolderAutoMountPermissionFilter = {
  equals?: MountPermission | null | undefined;
  in?: ReadonlyArray<MountPermission> | null | undefined;
  notEquals?: MountPermission | null | undefined;
  notIn?: ReadonlyArray<MountPermission> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type NullableDateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  isNull?: boolean | null | undefined;
  notEquals?: string | null | undefined;
};
export type VFolderAutoMountListQuery$variables = {
  filter?: VFolderAutoMountFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  scope: VFolderAutoMountScope;
};
export type VFolderAutoMountListQuery$data = {
  readonly scopedVfolderAutoMounts: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly mountDestination: string;
        readonly mountPermission: MountPermission;
        readonly subpath: string;
        readonly vfolder: {
          readonly metadata: {
            readonly name: string;
          };
        } | null | undefined;
        readonly vfolderId: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type VFolderAutoMountListQuery = {
  response: VFolderAutoMountListQuery$data;
  variables: VFolderAutoMountListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
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
    "variableName": "scope"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
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
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPermission",
  "storageKey": null
},
v12 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "VFolderAutoMountConnection",
        "kind": "LinkedField",
        "name": "scopedVfolderAutoMounts",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "VFolderAutoMountSettingModalFragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "VFolderAutoMountListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "VFolderAutoMountConnection",
        "kind": "LinkedField",
        "name": "scopedVfolderAutoMounts",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v12/*: any*/),
                      (v6/*: any*/)
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
  },
  "params": {
    "cacheID": "6f240497a8c86874c431d87e832d3805",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountListQuery",
    "operationKind": "query",
    "text": "query VFolderAutoMountListQuery(\n  $scope: VFolderAutoMountScope!\n  $filter: VFolderAutoMountFilter\n  $limit: Int\n  $offset: Int\n) {\n  scopedVfolderAutoMounts(scope: $scope, filter: $filter, orderBy: [{field: MOUNT_DESTINATION, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        vfolderId\n        mountDestination\n        subpath\n        mountPermission\n        vfolder {\n          metadata {\n            name\n          }\n          id\n        }\n        ...VFolderAutoMountSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  vfolderId\n  mountDestination\n  subpath\n  mountPermission\n  vfolder {\n    metadata {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7793316ead94bbbf0583f869d8a87459";

export default node;
