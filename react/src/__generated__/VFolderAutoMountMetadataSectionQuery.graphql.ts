/**
 * @generated SignedSource<<7fc7f1778fce6aa30f3cac2e030c7cd7>>
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
export type VFolderAutoMountMetadataSectionQuery$variables = {
  filter?: VFolderAutoMountFilter | null | undefined;
  scope: VFolderAutoMountScope;
};
export type VFolderAutoMountMetadataSectionQuery$data = {
  readonly scopedVfolderAutoMounts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly mountDestination: string;
        readonly mountPermission: MountPermission;
        readonly subpath: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type VFolderAutoMountMetadataSectionQuery = {
  response: VFolderAutoMountMetadataSectionQuery$data;
  variables: VFolderAutoMountMetadataSectionQuery$variables;
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
  "name": "scope"
},
v2 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
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
  "name": "entityId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPermission",
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
    "name": "VFolderAutoMountMetadataSectionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "VFolderAutoMountMetadataSectionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "vfolderId",
                    "storageKey": null
                  },
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
                      (v3/*: any*/)
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
    "cacheID": "914651ccfef060bc6e562fb45a2f2bde",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountMetadataSectionQuery",
    "operationKind": "query",
    "text": "query VFolderAutoMountMetadataSectionQuery(\n  $scope: VFolderAutoMountScope!\n  $filter: VFolderAutoMountFilter\n) {\n  scopedVfolderAutoMounts(scope: $scope, filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n        mountDestination\n        subpath\n        mountPermission\n        ...VFolderAutoMountSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  vfolderId\n  mountDestination\n  subpath\n  mountPermission\n  vfolder {\n    metadata {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e073f3c5be1f2729f594e8200d05236";

export default node;
