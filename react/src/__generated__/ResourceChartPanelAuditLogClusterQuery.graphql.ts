/**
 * @generated SignedSource<<aa8292501c14118dc76c8c7c264e1dbf>>
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
export type ResourceChartPanelAuditLogClusterQuery$variables = {
  c0?: AuditLogFilter | null | undefined;
  c0On: boolean;
  c1?: AuditLogFilter | null | undefined;
  c1On: boolean;
  c2?: AuditLogFilter | null | undefined;
  c2On: boolean;
  c3?: AuditLogFilter | null | undefined;
  c3On: boolean;
  c4?: AuditLogFilter | null | undefined;
  c4On: boolean;
  c5?: AuditLogFilter | null | undefined;
  c5On: boolean;
  c6?: AuditLogFilter | null | undefined;
  c6On: boolean;
  c7?: AuditLogFilter | null | undefined;
  c7On: boolean;
};
export type ResourceChartPanelAuditLogClusterQuery$data = {
  readonly c0?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c1?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c2?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c3?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c4?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c5?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c6?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly c7?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type ResourceChartPanelAuditLogClusterQuery = {
  response: ResourceChartPanelAuditLogClusterQuery$data;
  variables: ResourceChartPanelAuditLogClusterQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c0"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c0On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c1"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c1On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c2"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c2On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c3"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c3On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c4"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c4On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c5"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c5On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c6"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c6On"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c7"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "c7On"
  }
],
v1 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v2 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v4 = {
  "alias": "c0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c0"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v5 = {
  "alias": "c1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c1"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v6 = {
  "alias": "c2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c2"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v7 = {
  "alias": "c3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c3"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v8 = {
  "alias": "c4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c4"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": "c5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c5"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": "c6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c6"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": "c7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c7"
    },
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelAuditLogClusterQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v4/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v5/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v6/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v7/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v8/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v9/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v10/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v11/*: any*/),
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceChartPanelAuditLogClusterQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v4/*: any*/)
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v5/*: any*/)
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v6/*: any*/)
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v7/*: any*/)
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v8/*: any*/)
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v9/*: any*/)
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v10/*: any*/)
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v11/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "db546fa76601095aa64b306cba45b173",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelAuditLogClusterQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelAuditLogClusterQuery(\n  $c0: AuditLogFilter\n  $c0On: Boolean!\n  $c1: AuditLogFilter\n  $c1On: Boolean!\n  $c2: AuditLogFilter\n  $c2On: Boolean!\n  $c3: AuditLogFilter\n  $c3On: Boolean!\n  $c4: AuditLogFilter\n  $c4On: Boolean!\n  $c5: AuditLogFilter\n  $c5On: Boolean!\n  $c6: AuditLogFilter\n  $c6On: Boolean!\n  $c7: AuditLogFilter\n  $c7On: Boolean!\n) {\n  c0: adminAuditLogsV2(limit: 1, offset: 0, filter: $c0) @include(if: $c0On) {\n    count\n  }\n  c1: adminAuditLogsV2(limit: 1, offset: 0, filter: $c1) @include(if: $c1On) {\n    count\n  }\n  c2: adminAuditLogsV2(limit: 1, offset: 0, filter: $c2) @include(if: $c2On) {\n    count\n  }\n  c3: adminAuditLogsV2(limit: 1, offset: 0, filter: $c3) @include(if: $c3On) {\n    count\n  }\n  c4: adminAuditLogsV2(limit: 1, offset: 0, filter: $c4) @include(if: $c4On) {\n    count\n  }\n  c5: adminAuditLogsV2(limit: 1, offset: 0, filter: $c5) @include(if: $c5On) {\n    count\n  }\n  c6: adminAuditLogsV2(limit: 1, offset: 0, filter: $c6) @include(if: $c6On) {\n    count\n  }\n  c7: adminAuditLogsV2(limit: 1, offset: 0, filter: $c7) @include(if: $c7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "fe8836902e72cfc5be5e4f3c427ba221";

export default node;
