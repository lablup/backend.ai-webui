/**
 * @generated SignedSource<<e043716cd54300deb38cf5e10c813b9c>>
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
export type AuditLogPanelScopedQuery$variables = {
  live0On: boolean;
  live1On: boolean;
  liveF0?: AuditLogFilter | null | undefined;
  liveF1?: AuditLogFilter | null | undefined;
  liveS0?: AuditLogFilter | null | undefined;
  liveS1?: AuditLogFilter | null | undefined;
  previousFailure?: AuditLogFilter | null | undefined;
  previousOn: boolean;
  previousSuccess?: AuditLogFilter | null | undefined;
  scope: AuditLogScope;
};
export type AuditLogPanelScopedQuery$data = {
  readonly liveF0?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly liveF1?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly liveS0?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly liveS1?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly previousFailure?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly previousSuccess?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type AuditLogPanelScopedQuery = {
  response: AuditLogPanelScopedQuery$data;
  variables: AuditLogPanelScopedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "live0On"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "live1On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveF0"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveF1"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveS0"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveS1"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFailure"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousOn"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousSuccess"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v10 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v11 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v12 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v13 = {
  "alias": "previousSuccess",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousSuccess"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": "previousFailure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailure"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": "liveS0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS0"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": "liveF0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF0"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": "liveS1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS1"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v18 = {
  "alias": "liveF1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF1"
    },
    (v10/*: any*/),
    (v11/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v12/*: any*/),
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
      (v8/*: any*/),
      (v9/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelScopedQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v13/*: any*/),
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": (v14/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "live0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v15/*: any*/),
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": (v16/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "live1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v17/*: any*/),
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": (v18/*: any*/),
            "to": "RESULT"
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
      (v9/*: any*/),
      (v8/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "AuditLogPanelScopedQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v13/*: any*/),
          (v14/*: any*/)
        ]
      },
      {
        "condition": "live0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v15/*: any*/),
          (v16/*: any*/)
        ]
      },
      {
        "condition": "live1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v17/*: any*/),
          (v18/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d60efbf46974456ef544c51a542c6551",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelScopedQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelScopedQuery(\n  $scope: AuditLogScope!\n  $previousSuccess: AuditLogFilter\n  $previousFailure: AuditLogFilter\n  $previousOn: Boolean!\n  $liveS0: AuditLogFilter\n  $liveF0: AuditLogFilter\n  $live0On: Boolean!\n  $liveS1: AuditLogFilter\n  $liveF1: AuditLogFilter\n  $live1On: Boolean!\n) {\n  previousSuccess: scopedAuditLogsV2(scope: $scope, filter: $previousSuccess, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  previousFailure: scopedAuditLogsV2(scope: $scope, filter: $previousFailure, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  liveS0: scopedAuditLogsV2(scope: $scope, filter: $liveS0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveF0: scopedAuditLogsV2(scope: $scope, filter: $liveF0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveS1: scopedAuditLogsV2(scope: $scope, filter: $liveS1, limit: 1) @include(if: $live1On) {\n    count\n  }\n  liveF1: scopedAuditLogsV2(scope: $scope, filter: $liveF1, limit: 1) @include(if: $live1On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce7627dd86ef9ad2c164197802836e5f";

export default node;
