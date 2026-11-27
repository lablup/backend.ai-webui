/**
 * @generated SignedSource<<6b40e90e45da9770daa4f3ea28660d48>>
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
export type ResourceChartPanelAuditLogQuery$variables = {
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
  scope: AuditLogScope;
};
export type ResourceChartPanelAuditLogQuery$data = {
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
export type ResourceChartPanelAuditLogQuery = {
  response: ResourceChartPanelAuditLogQuery$data;
  variables: ResourceChartPanelAuditLogQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c0On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c1On"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c2On"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c3On"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c4On"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c5On"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c6On"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "c7On"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v17 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v18 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v19 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v20 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v21 = {
  "alias": "c0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c0"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": "c1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c1"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v23 = {
  "alias": "c2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c2"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v24 = {
  "alias": "c3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c3"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v25 = {
  "alias": "c4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c4"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v26 = {
  "alias": "c5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c5"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v27 = {
  "alias": "c6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c6"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
  "storageKey": null
},
v28 = {
  "alias": "c7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "c7"
    },
    (v17/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v20/*: any*/),
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
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelAuditLogQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v21/*: any*/),
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
            "field": (v22/*: any*/),
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
            "field": (v23/*: any*/),
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
            "field": (v24/*: any*/),
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
            "field": (v25/*: any*/),
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
            "field": (v26/*: any*/),
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
            "field": (v27/*: any*/),
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
            "field": (v28/*: any*/),
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
      (v16/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceChartPanelAuditLogQuery",
    "selections": [
      {
        "condition": "c0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v21/*: any*/)
        ]
      },
      {
        "condition": "c1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v22/*: any*/)
        ]
      },
      {
        "condition": "c2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v23/*: any*/)
        ]
      },
      {
        "condition": "c3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v24/*: any*/)
        ]
      },
      {
        "condition": "c4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v25/*: any*/)
        ]
      },
      {
        "condition": "c5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v26/*: any*/)
        ]
      },
      {
        "condition": "c6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v27/*: any*/)
        ]
      },
      {
        "condition": "c7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v28/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9c59aee2c8585c504572ab1c02676ce8",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelAuditLogQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelAuditLogQuery(\n  $scope: AuditLogScope!\n  $c0: AuditLogFilter\n  $c0On: Boolean!\n  $c1: AuditLogFilter\n  $c1On: Boolean!\n  $c2: AuditLogFilter\n  $c2On: Boolean!\n  $c3: AuditLogFilter\n  $c3On: Boolean!\n  $c4: AuditLogFilter\n  $c4On: Boolean!\n  $c5: AuditLogFilter\n  $c5On: Boolean!\n  $c6: AuditLogFilter\n  $c6On: Boolean!\n  $c7: AuditLogFilter\n  $c7On: Boolean!\n) {\n  c0: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c0) @include(if: $c0On) {\n    count\n  }\n  c1: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c1) @include(if: $c1On) {\n    count\n  }\n  c2: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c2) @include(if: $c2On) {\n    count\n  }\n  c3: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c3) @include(if: $c3On) {\n    count\n  }\n  c4: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c4) @include(if: $c4On) {\n    count\n  }\n  c5: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c5) @include(if: $c5On) {\n    count\n  }\n  c6: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c6) @include(if: $c6On) {\n    count\n  }\n  c7: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c7) @include(if: $c7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "3c62e36d123e45c2d3b7c60357eaf942";

export default node;
