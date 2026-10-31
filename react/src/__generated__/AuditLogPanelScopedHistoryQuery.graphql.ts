/**
 * @generated SignedSource<<e39eb4d82dfaad43c6f3680cb6a602e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
export type AuditLogPanelScopedHistoryQuery$variables = {
  f0?: AuditLogFilter | null | undefined;
  f0On: boolean;
  f1?: AuditLogFilter | null | undefined;
  f1On: boolean;
  f2?: AuditLogFilter | null | undefined;
  f2On: boolean;
  f3?: AuditLogFilter | null | undefined;
  f3On: boolean;
  f4?: AuditLogFilter | null | undefined;
  f4On: boolean;
  f5?: AuditLogFilter | null | undefined;
  f5On: boolean;
  f6?: AuditLogFilter | null | undefined;
  f6On: boolean;
  f7?: AuditLogFilter | null | undefined;
  f7On: boolean;
  previousFailure?: AuditLogFilter | null | undefined;
  previousOn: boolean;
  previousSuccess?: AuditLogFilter | null | undefined;
  s0?: AuditLogFilter | null | undefined;
  s0On: boolean;
  s1?: AuditLogFilter | null | undefined;
  s1On: boolean;
  s2?: AuditLogFilter | null | undefined;
  s2On: boolean;
  s3?: AuditLogFilter | null | undefined;
  s3On: boolean;
  s4?: AuditLogFilter | null | undefined;
  s4On: boolean;
  s5?: AuditLogFilter | null | undefined;
  s5On: boolean;
  s6?: AuditLogFilter | null | undefined;
  s6On: boolean;
  s7?: AuditLogFilter | null | undefined;
  s7On: boolean;
  scope: AuditLogScope;
};
export type AuditLogPanelScopedHistoryQuery$data = {
  readonly f0?: {
    readonly count: number;
  } | null | undefined;
  readonly f1?: {
    readonly count: number;
  } | null | undefined;
  readonly f2?: {
    readonly count: number;
  } | null | undefined;
  readonly f3?: {
    readonly count: number;
  } | null | undefined;
  readonly f4?: {
    readonly count: number;
  } | null | undefined;
  readonly f5?: {
    readonly count: number;
  } | null | undefined;
  readonly f6?: {
    readonly count: number;
  } | null | undefined;
  readonly f7?: {
    readonly count: number;
  } | null | undefined;
  readonly previousFailure?: {
    readonly count: number;
  } | null | undefined;
  readonly previousSuccess?: {
    readonly count: number;
  } | null | undefined;
  readonly s0?: {
    readonly count: number;
  } | null | undefined;
  readonly s1?: {
    readonly count: number;
  } | null | undefined;
  readonly s2?: {
    readonly count: number;
  } | null | undefined;
  readonly s3?: {
    readonly count: number;
  } | null | undefined;
  readonly s4?: {
    readonly count: number;
  } | null | undefined;
  readonly s5?: {
    readonly count: number;
  } | null | undefined;
  readonly s6?: {
    readonly count: number;
  } | null | undefined;
  readonly s7?: {
    readonly count: number;
  } | null | undefined;
};
export type AuditLogPanelScopedHistoryQuery = {
  response: AuditLogPanelScopedHistoryQuery$data;
  variables: AuditLogPanelScopedHistoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f0On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f1"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f1On"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f2"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f2On"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f3"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f3On"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f4"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f4On"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f5"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f5On"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f6"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f6On"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f7"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "f7On"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFailure"
},
v17 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousOn"
},
v18 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousSuccess"
},
v19 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s0"
},
v20 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s0On"
},
v21 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s1"
},
v22 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s1On"
},
v23 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s2"
},
v24 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s2On"
},
v25 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s3"
},
v26 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s3On"
},
v27 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s4"
},
v28 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s4On"
},
v29 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s5"
},
v30 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s5On"
},
v31 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s6"
},
v32 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s6On"
},
v33 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s7"
},
v34 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s7On"
},
v35 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v36 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v37 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v38 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v39 = {
  "alias": "previousSuccess",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousSuccess"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v40 = {
  "alias": "previousFailure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailure"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v41 = {
  "alias": "s0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s0"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v42 = {
  "alias": "s1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s1"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v43 = {
  "alias": "s2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s2"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v44 = {
  "alias": "s3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s3"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v45 = {
  "alias": "s4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s4"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v46 = {
  "alias": "s5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s5"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v47 = {
  "alias": "s6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s6"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v48 = {
  "alias": "s7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "s7"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v49 = {
  "alias": "f0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f0"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v50 = {
  "alias": "f1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f1"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v51 = {
  "alias": "f2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f2"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v52 = {
  "alias": "f3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f3"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v53 = {
  "alias": "f4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f4"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v54 = {
  "alias": "f5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f5"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v55 = {
  "alias": "f6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f6"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v56 = {
  "alias": "f7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "f7"
    },
    (v36/*: any*/),
    (v37/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v38/*: any*/),
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
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/),
      (v20/*: any*/),
      (v21/*: any*/),
      (v22/*: any*/),
      (v23/*: any*/),
      (v24/*: any*/),
      (v25/*: any*/),
      (v26/*: any*/),
      (v27/*: any*/),
      (v28/*: any*/),
      (v29/*: any*/),
      (v30/*: any*/),
      (v31/*: any*/),
      (v32/*: any*/),
      (v33/*: any*/),
      (v34/*: any*/),
      (v35/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelScopedHistoryQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v39/*: any*/),
            "to": "NULL"
          },
          {
            "kind": "CatchField",
            "field": (v40/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v41/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v42/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v43/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v44/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v45/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v46/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v47/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "s7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v48/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v49/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v50/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v51/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v52/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v53/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v54/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v55/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "f7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v56/*: any*/),
            "to": "NULL"
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
      (v35/*: any*/),
      (v18/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v19/*: any*/),
      (v20/*: any*/),
      (v21/*: any*/),
      (v22/*: any*/),
      (v23/*: any*/),
      (v24/*: any*/),
      (v25/*: any*/),
      (v26/*: any*/),
      (v27/*: any*/),
      (v28/*: any*/),
      (v29/*: any*/),
      (v30/*: any*/),
      (v31/*: any*/),
      (v32/*: any*/),
      (v33/*: any*/),
      (v34/*: any*/),
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
    "name": "AuditLogPanelScopedHistoryQuery",
    "selections": [
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v39/*: any*/),
          (v40/*: any*/)
        ]
      },
      {
        "condition": "s0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v41/*: any*/)
        ]
      },
      {
        "condition": "s1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v42/*: any*/)
        ]
      },
      {
        "condition": "s2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v43/*: any*/)
        ]
      },
      {
        "condition": "s3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v44/*: any*/)
        ]
      },
      {
        "condition": "s4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v45/*: any*/)
        ]
      },
      {
        "condition": "s5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v46/*: any*/)
        ]
      },
      {
        "condition": "s6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v47/*: any*/)
        ]
      },
      {
        "condition": "s7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v48/*: any*/)
        ]
      },
      {
        "condition": "f0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v49/*: any*/)
        ]
      },
      {
        "condition": "f1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v50/*: any*/)
        ]
      },
      {
        "condition": "f2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v51/*: any*/)
        ]
      },
      {
        "condition": "f3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v52/*: any*/)
        ]
      },
      {
        "condition": "f4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v53/*: any*/)
        ]
      },
      {
        "condition": "f5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v54/*: any*/)
        ]
      },
      {
        "condition": "f6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v55/*: any*/)
        ]
      },
      {
        "condition": "f7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v56/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "4de8ace8e23b6eb28a6cdf87c1cade00",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelScopedHistoryQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelScopedHistoryQuery(\n  $scope: AuditLogScope!\n  $previousSuccess: AuditLogFilter\n  $previousFailure: AuditLogFilter\n  $previousOn: Boolean!\n  $s0: AuditLogFilter\n  $s0On: Boolean!\n  $s1: AuditLogFilter\n  $s1On: Boolean!\n  $s2: AuditLogFilter\n  $s2On: Boolean!\n  $s3: AuditLogFilter\n  $s3On: Boolean!\n  $s4: AuditLogFilter\n  $s4On: Boolean!\n  $s5: AuditLogFilter\n  $s5On: Boolean!\n  $s6: AuditLogFilter\n  $s6On: Boolean!\n  $s7: AuditLogFilter\n  $s7On: Boolean!\n  $f0: AuditLogFilter\n  $f0On: Boolean!\n  $f1: AuditLogFilter\n  $f1On: Boolean!\n  $f2: AuditLogFilter\n  $f2On: Boolean!\n  $f3: AuditLogFilter\n  $f3On: Boolean!\n  $f4: AuditLogFilter\n  $f4On: Boolean!\n  $f5: AuditLogFilter\n  $f5On: Boolean!\n  $f6: AuditLogFilter\n  $f6On: Boolean!\n  $f7: AuditLogFilter\n  $f7On: Boolean!\n) {\n  previousSuccess: scopedAuditLogsV2(scope: $scope, filter: $previousSuccess, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  previousFailure: scopedAuditLogsV2(scope: $scope, filter: $previousFailure, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  s0: scopedAuditLogsV2(scope: $scope, filter: $s0, limit: 1) @include(if: $s0On) {\n    count\n  }\n  s1: scopedAuditLogsV2(scope: $scope, filter: $s1, limit: 1) @include(if: $s1On) {\n    count\n  }\n  s2: scopedAuditLogsV2(scope: $scope, filter: $s2, limit: 1) @include(if: $s2On) {\n    count\n  }\n  s3: scopedAuditLogsV2(scope: $scope, filter: $s3, limit: 1) @include(if: $s3On) {\n    count\n  }\n  s4: scopedAuditLogsV2(scope: $scope, filter: $s4, limit: 1) @include(if: $s4On) {\n    count\n  }\n  s5: scopedAuditLogsV2(scope: $scope, filter: $s5, limit: 1) @include(if: $s5On) {\n    count\n  }\n  s6: scopedAuditLogsV2(scope: $scope, filter: $s6, limit: 1) @include(if: $s6On) {\n    count\n  }\n  s7: scopedAuditLogsV2(scope: $scope, filter: $s7, limit: 1) @include(if: $s7On) {\n    count\n  }\n  f0: scopedAuditLogsV2(scope: $scope, filter: $f0, limit: 1) @include(if: $f0On) {\n    count\n  }\n  f1: scopedAuditLogsV2(scope: $scope, filter: $f1, limit: 1) @include(if: $f1On) {\n    count\n  }\n  f2: scopedAuditLogsV2(scope: $scope, filter: $f2, limit: 1) @include(if: $f2On) {\n    count\n  }\n  f3: scopedAuditLogsV2(scope: $scope, filter: $f3, limit: 1) @include(if: $f3On) {\n    count\n  }\n  f4: scopedAuditLogsV2(scope: $scope, filter: $f4, limit: 1) @include(if: $f4On) {\n    count\n  }\n  f5: scopedAuditLogsV2(scope: $scope, filter: $f5, limit: 1) @include(if: $f5On) {\n    count\n  }\n  f6: scopedAuditLogsV2(scope: $scope, filter: $f6, limit: 1) @include(if: $f6On) {\n    count\n  }\n  f7: scopedAuditLogsV2(scope: $scope, filter: $f7, limit: 1) @include(if: $f7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "eda1a66259d126daa83c814746ca7d0b";

export default node;
