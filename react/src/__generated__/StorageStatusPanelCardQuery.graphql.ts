/**
 * @generated SignedSource<<2c20c55be6eb2afbad2a63f630eadc8c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type VFolderFilter = {
  AND?: ReadonlyArray<VFolderFilter> | null | undefined;
  NOT?: ReadonlyArray<VFolderFilter> | null | undefined;
  OR?: ReadonlyArray<VFolderFilter> | null | undefined;
  cloneable?: boolean | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
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
export type StorageStatusPanelCardQuery$variables = {
  activeFilter?: VFolderFilter | null | undefined;
  projectId: string;
  projectIdForPolicy: string;
};
export type StorageStatusPanelCardQuery$data = {
  readonly myUserResourcePolicyV2: {
    readonly maxVfolderCount: number;
  } | null | undefined;
  readonly myVfolders: {
    readonly count: number;
  } | null | undefined;
  readonly projectVfolders: {
    readonly count: number;
  } | null | undefined;
  readonly scopedProjectResourcePolicyV2: {
    readonly maxVfolderCount: number;
  } | null | undefined;
};
export type StorageStatusPanelCardQuery = {
  response: StorageStatusPanelCardQuery$data;
  variables: StorageStatusPanelCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "activeFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectIdForPolicy"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxVfolderCount",
  "storageKey": null
},
v4 = [
  (v3/*: any*/)
],
v5 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectIdForPolicy"
  }
],
v6 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "activeFilter"
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v8 = {
  "alias": null,
  "args": [
    (v6/*: any*/)
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "myVfolders",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": [
    (v6/*: any*/),
    {
      "kind": "Variable",
      "name": "projectId",
      "variableName": "projectId"
    }
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "projectVfolders",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v10 = [
  (v3/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myUserResourcePolicyV2",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ProjectResourcePolicyV2",
        "kind": "LinkedField",
        "name": "scopedProjectResourcePolicyV2",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      },
      (v8/*: any*/),
      (v9/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myUserResourcePolicyV2",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ProjectResourcePolicyV2",
        "kind": "LinkedField",
        "name": "scopedProjectResourcePolicyV2",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      (v8/*: any*/),
      (v9/*: any*/)
    ]
  },
  "params": {
    "cacheID": "ff3f7c668317694920e9fb02607f5599",
    "id": null,
    "metadata": {},
    "name": "StorageStatusPanelCardQuery",
    "operationKind": "query",
    "text": "query StorageStatusPanelCardQuery(\n  $projectId: UUID!\n  $projectIdForPolicy: ID!\n  $activeFilter: VFolderFilter\n) {\n  myUserResourcePolicyV2 {\n    maxVfolderCount\n    id\n  }\n  scopedProjectResourcePolicyV2(projectId: $projectIdForPolicy) {\n    maxVfolderCount\n    id\n  }\n  myVfolders(filter: $activeFilter) {\n    count\n  }\n  projectVfolders(projectId: $projectId, filter: $activeFilter) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "d7cfdd02d25042785dd056f79586ef46";

export default node;
