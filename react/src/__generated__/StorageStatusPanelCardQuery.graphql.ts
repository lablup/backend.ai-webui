/**
 * @generated SignedSource<<43e4268a23db5e4a1fe01a39dba2dec7>>
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
  name: string;
  projectId: string;
  supportsResourcePolicyV2: boolean;
  supportsVfolderV2: boolean;
};
export type StorageStatusPanelCardQuery$data = {
  readonly myUserResourcePolicyV2?: {
    readonly maxVfolderCount: number;
  } | null | undefined;
  readonly myVfolders?: {
    readonly count: number;
  } | null | undefined;
  readonly projectVfolders?: {
    readonly count: number;
  } | null | undefined;
  readonly project_resource_policy: {
    readonly max_vfolder_count: number | null | undefined;
  } | null | undefined;
  readonly user_resource_policy?: {
    readonly max_vfolder_count: number | null | undefined;
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
  "name": "name"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsResourcePolicyV2"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsVfolderV2"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxVfolderCount",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_count",
  "storageKey": null
},
v7 = [
  (v6/*: any*/)
],
v8 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
],
v9 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "activeFilter"
},
v10 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v11 = {
  "condition": "supportsVfolderV2",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": [
        (v9/*: any*/)
      ],
      "concreteType": "VFolderConnection",
      "kind": "LinkedField",
      "name": "myVfolders",
      "plural": false,
      "selections": (v10/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        (v9/*: any*/),
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
      "selections": (v10/*: any*/),
      "storageKey": null
    }
  ]
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = [
  (v6/*: any*/),
  (v12/*: any*/)
];
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
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myUserResourcePolicyV2",
            "plural": false,
            "selections": [
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": null
      },
      (v11/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myUserResourcePolicyV2",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              (v12/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v13/*: any*/),
        "storageKey": null
      },
      (v11/*: any*/)
    ]
  },
  "params": {
    "cacheID": "90561a49566759d7d0a2e1ffcbcb93a8",
    "id": null,
    "metadata": {},
    "name": "StorageStatusPanelCardQuery",
    "operationKind": "query",
    "text": "query StorageStatusPanelCardQuery(\n  $name: String!\n  $projectId: UUID!\n  $activeFilter: VFolderFilter\n  $supportsResourcePolicyV2: Boolean!\n  $supportsVfolderV2: Boolean!\n) {\n  myUserResourcePolicyV2 @include(if: $supportsResourcePolicyV2) @since(version: \"26.4.2\") {\n    maxVfolderCount\n    id\n  }\n  user_resource_policy @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    max_vfolder_count\n    id\n  }\n  project_resource_policy(name: $name) {\n    max_vfolder_count\n    id\n  }\n  myVfolders(filter: $activeFilter) @include(if: $supportsVfolderV2) @since(version: \"26.4.2\") {\n    count\n  }\n  projectVfolders(projectId: $projectId, filter: $activeFilter) @include(if: $supportsVfolderV2) @since(version: \"26.4.2\") {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "79c8a3c1bb19d6fd941edc765c24231e";

export default node;
