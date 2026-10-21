/**
 * @generated SignedSource<<fbd913fd714c9e38ad6ba9d6d70df19d>>
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
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type BAIScopedVFolderSelectQuery$variables = {
  filter?: VFolderFilter | null | undefined;
  limit: number;
  offset: number;
  scope: VFolderScope;
};
export type BAIScopedVFolderSelectQuery$data = {
  readonly scopedVFoldersV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessControl: {
          readonly permission: VFolderMountPermission;
        };
        readonly entityId: string;
        readonly host: string;
        readonly metadata: {
          readonly createdAt: string;
          readonly name: string;
          readonly usageMode: VFolderUsageMode;
        };
        readonly ownership: {
          readonly creatorEmail: string | null | undefined;
        };
      };
    }>;
  } | null | undefined;
};
export type BAIScopedVFolderSelectQuery = {
  response: BAIScopedVFolderSelectQuery$data;
  variables: BAIScopedVFolderSelectQuery$variables;
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
        "direction": "DESC",
        "field": "CREATED_AT"
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
  "name": "entityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v8 = {
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
    },
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
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = {
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
v10 = {
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
      "name": "creatorEmail",
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
    "name": "BAIScopedVFolderSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "VFolderConnection",
        "kind": "LinkedField",
        "name": "scopedVFoldersV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/)
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
    "name": "BAIScopedVFolderSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "VFolderConnection",
        "kind": "LinkedField",
        "name": "scopedVFoldersV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
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
    "cacheID": "f8503b094ad7ec0fa9b12716124861dc",
    "id": null,
    "metadata": {},
    "name": "BAIScopedVFolderSelectQuery",
    "operationKind": "query",
    "text": "query BAIScopedVFolderSelectQuery(\n  $scope: VFolderScope!\n  $filter: VFolderFilter\n  $limit: Int!\n  $offset: Int!\n) {\n  scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit, offset: $offset, orderBy: [{field: CREATED_AT, direction: DESC}]) {\n    count\n    edges {\n      node {\n        entityId\n        host\n        metadata {\n          name\n          usageMode\n          createdAt\n        }\n        accessControl {\n          permission\n        }\n        ownership {\n          creatorEmail\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8175ce72d83449756845852dfc7fe0f0";

export default node;
