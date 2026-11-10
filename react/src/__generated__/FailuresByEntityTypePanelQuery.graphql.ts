/**
 * @generated SignedSource<<09dadf37db11449f15c55eda1835ad0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type AuditLogActionKind = "BULK" | "GLOBAL" | "LOOKUP" | "MEMBERSHIP" | "RELATION" | "SCOPE" | "SINGLE_ENTITY" | "%future added value";
export type AuditLogStatus = "DENIED" | "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
export type AuditLogScope = {
  entity?: ReadonlyArray<EntityTypeScope> | null | undefined;
  triggeredUser?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type EntityTypeScope = {
  entityId: string;
  entityType: string;
};
export type UUIDScope = {
  value: string;
};
export type AuditLogFilter = {
  AND?: ReadonlyArray<AuditLogFilter> | null | undefined;
  NOT?: ReadonlyArray<AuditLogFilter> | null | undefined;
  OR?: ReadonlyArray<AuditLogFilter> | null | undefined;
  actedAs?: UUIDFilter | null | undefined;
  actionId?: UUIDFilter | null | undefined;
  actionKind?: AuditLogActionKindFilter | null | undefined;
  actionName?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: StringFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  lookupKey?: StringFilter | null | undefined;
  lookupKind?: StringFilter | null | undefined;
  operation?: StringFilter | null | undefined;
  status?: AuditLogStatusFilter | null | undefined;
  targetEntityId?: UUIDFilter | null | undefined;
  triggeredBy?: StringFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type AuditLogStatusFilter = {
  equals?: AuditLogStatus | null | undefined;
  in?: ReadonlyArray<AuditLogStatus> | null | undefined;
  notEquals?: AuditLogStatus | null | undefined;
  notIn?: ReadonlyArray<AuditLogStatus> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type AuditLogActionKindFilter = {
  equals?: AuditLogActionKind | null | undefined;
  in?: ReadonlyArray<AuditLogActionKind> | null | undefined;
  notEquals?: AuditLogActionKind | null | undefined;
  notIn?: ReadonlyArray<AuditLogActionKind> | null | undefined;
};
export type FailuresByEntityTypePanelQuery$variables = {
  artifactRegistry: AuditLogFilter;
  deployment: AuditLogFilter;
  other: AuditLogFilter;
  project: AuditLogFilter;
  resourceGroup: AuditLogFilter;
  scope: AuditLogScope;
  session: AuditLogFilter;
  user: AuditLogFilter;
  vfolder: AuditLogFilter;
};
export type FailuresByEntityTypePanelQuery$data = {
  readonly artifactRegistry: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly deployment: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly other: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly project: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly resourceGroup: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly session: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly user: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly vfolder: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type FailuresByEntityTypePanelQuery = {
  response: FailuresByEntityTypePanelQuery$data;
  variables: FailuresByEntityTypePanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "artifactRegistry"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deployment"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "other"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "session"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolder"
},
v9 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v10 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v12 = {
  "alias": "session",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "session"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": "vfolder",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "vfolder"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": "deployment",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "deployment"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": "user",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "user"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": "project",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "project"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": "resourceGroup",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "resourceGroup"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v18 = {
  "alias": "artifactRegistry",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "artifactRegistry"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v19 = {
  "alias": "other",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "other"
    },
    (v9/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FailuresByEntityTypePanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v12/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v13/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v14/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v15/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v16/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v17/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v18/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v19/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v5/*: any*/),
      (v6/*: any*/),
      (v8/*: any*/),
      (v1/*: any*/),
      (v7/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "FailuresByEntityTypePanelQuery",
    "selections": [
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/)
    ]
  },
  "params": {
    "cacheID": "a49ab7ea29976f4e22d50abe40a5456b",
    "id": null,
    "metadata": {},
    "name": "FailuresByEntityTypePanelQuery",
    "operationKind": "query",
    "text": "query FailuresByEntityTypePanelQuery(\n  $scope: AuditLogScope!\n  $session: AuditLogFilter!\n  $vfolder: AuditLogFilter!\n  $deployment: AuditLogFilter!\n  $user: AuditLogFilter!\n  $project: AuditLogFilter!\n  $resourceGroup: AuditLogFilter!\n  $artifactRegistry: AuditLogFilter!\n  $other: AuditLogFilter!\n) {\n  session: scopedAuditLogsV2(scope: $scope, filter: $session, limit: 1) {\n    count\n  }\n  vfolder: scopedAuditLogsV2(scope: $scope, filter: $vfolder, limit: 1) {\n    count\n  }\n  deployment: scopedAuditLogsV2(scope: $scope, filter: $deployment, limit: 1) {\n    count\n  }\n  user: scopedAuditLogsV2(scope: $scope, filter: $user, limit: 1) {\n    count\n  }\n  project: scopedAuditLogsV2(scope: $scope, filter: $project, limit: 1) {\n    count\n  }\n  resourceGroup: scopedAuditLogsV2(scope: $scope, filter: $resourceGroup, limit: 1) {\n    count\n  }\n  artifactRegistry: scopedAuditLogsV2(scope: $scope, filter: $artifactRegistry, limit: 1) {\n    count\n  }\n  other: scopedAuditLogsV2(scope: $scope, filter: $other, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "ffc4786e0967b5ddcc28246f0863862f";

export default node;
