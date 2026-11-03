/**
 * @generated SignedSource<<bfece4f80b4c263d87923a796af00d47>>
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
export type AuditLogPanelAdminQuery$variables = {
  live0On: boolean;
  live1On: boolean;
  liveF0?: AuditLogFilter | null | undefined;
  liveF1?: AuditLogFilter | null | undefined;
  liveS0?: AuditLogFilter | null | undefined;
  liveS1?: AuditLogFilter | null | undefined;
  previousFailure?: AuditLogFilter | null | undefined;
  previousOn: boolean;
  previousSuccess?: AuditLogFilter | null | undefined;
};
export type AuditLogPanelAdminQuery$data = {
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
export type AuditLogPanelAdminQuery = {
  response: AuditLogPanelAdminQuery$data;
  variables: AuditLogPanelAdminQuery$variables;
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
  "kind": "Literal",
  "name": "limit",
  "value": 1
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
  "alias": "previousSuccess",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousSuccess"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": "previousFailure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailure"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": "liveS0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS0"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": "liveF0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF0"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": "liveS1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS1"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": "liveF1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF1"
    },
    (v9/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v10/*: any*/),
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
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v11/*: any*/),
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": (v12/*: any*/),
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
        "condition": "live1On",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
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
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v11/*: any*/),
          (v12/*: any*/)
        ]
      },
      {
        "condition": "live0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v13/*: any*/),
          (v14/*: any*/)
        ]
      },
      {
        "condition": "live1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v15/*: any*/),
          (v16/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9c6845a96e3a4f3e7e5957dd5a099f74",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelAdminQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelAdminQuery(\n  $previousSuccess: AuditLogFilter\n  $previousFailure: AuditLogFilter\n  $previousOn: Boolean!\n  $liveS0: AuditLogFilter\n  $liveF0: AuditLogFilter\n  $live0On: Boolean!\n  $liveS1: AuditLogFilter\n  $liveF1: AuditLogFilter\n  $live1On: Boolean!\n) {\n  previousSuccess: adminAuditLogsV2(filter: $previousSuccess, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  previousFailure: adminAuditLogsV2(filter: $previousFailure, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  liveS0: adminAuditLogsV2(filter: $liveS0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveF0: adminAuditLogsV2(filter: $liveF0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveS1: adminAuditLogsV2(filter: $liveS1, limit: 1) @include(if: $live1On) {\n    count\n  }\n  liveF1: adminAuditLogsV2(filter: $liveF1, limit: 1) @include(if: $live1On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "6687531e4a0b2053a6781a217cac547e";

export default node;
