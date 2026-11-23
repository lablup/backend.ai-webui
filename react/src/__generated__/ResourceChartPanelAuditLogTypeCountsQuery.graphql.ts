/**
 * @generated SignedSource<<40e9c34a41328ea478a7930be9f0a4ba>>
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
export type ResourceChartPanelAuditLogTypeCountsQuery$variables = {
  k0?: AuditLogFilter | null | undefined;
  k0On: boolean;
  k1?: AuditLogFilter | null | undefined;
  k10?: AuditLogFilter | null | undefined;
  k10On: boolean;
  k11?: AuditLogFilter | null | undefined;
  k11On: boolean;
  k12?: AuditLogFilter | null | undefined;
  k12On: boolean;
  k13?: AuditLogFilter | null | undefined;
  k13On: boolean;
  k14?: AuditLogFilter | null | undefined;
  k14On: boolean;
  k15?: AuditLogFilter | null | undefined;
  k15On: boolean;
  k1On: boolean;
  k2?: AuditLogFilter | null | undefined;
  k2On: boolean;
  k3?: AuditLogFilter | null | undefined;
  k3On: boolean;
  k4?: AuditLogFilter | null | undefined;
  k4On: boolean;
  k5?: AuditLogFilter | null | undefined;
  k5On: boolean;
  k6?: AuditLogFilter | null | undefined;
  k6On: boolean;
  k7?: AuditLogFilter | null | undefined;
  k7On: boolean;
  k8?: AuditLogFilter | null | undefined;
  k8On: boolean;
  k9?: AuditLogFilter | null | undefined;
  k9On: boolean;
  scope: AuditLogScope;
};
export type ResourceChartPanelAuditLogTypeCountsQuery$data = {
  readonly k0?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k1?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k10?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k11?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k12?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k13?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k14?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k15?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k2?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k3?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k4?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k5?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k6?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k7?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k8?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly k9?: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
};
export type ResourceChartPanelAuditLogTypeCountsQuery = {
  response: ResourceChartPanelAuditLogTypeCountsQuery$data;
  variables: ResourceChartPanelAuditLogTypeCountsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k0On"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k1"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k10"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k10On"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k11"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k11On"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k12"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k12On"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k13"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k13On"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k14"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k14On"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k15"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k15On"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k1On"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k2"
},
v17 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k2On"
},
v18 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k3"
},
v19 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k3On"
},
v20 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k4"
},
v21 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k4On"
},
v22 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k5"
},
v23 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k5On"
},
v24 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k6"
},
v25 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k6On"
},
v26 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k7"
},
v27 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k7On"
},
v28 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k8"
},
v29 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k8On"
},
v30 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k9"
},
v31 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "k9On"
},
v32 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v33 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v34 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v35 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v36 = {
  "alias": "k0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k0"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v37 = {
  "alias": "k1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k1"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v38 = {
  "alias": "k2",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k2"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v39 = {
  "alias": "k3",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k3"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v40 = {
  "alias": "k4",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k4"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v41 = {
  "alias": "k5",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k5"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v42 = {
  "alias": "k6",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k6"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v43 = {
  "alias": "k7",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k7"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v44 = {
  "alias": "k8",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k8"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v45 = {
  "alias": "k9",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k9"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v46 = {
  "alias": "k10",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k10"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v47 = {
  "alias": "k11",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k11"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v48 = {
  "alias": "k12",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k12"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v49 = {
  "alias": "k13",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k13"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v50 = {
  "alias": "k14",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k14"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
  "storageKey": null
},
v51 = {
  "alias": "k15",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "k15"
    },
    (v33/*: any*/),
    (v34/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "scopedAuditLogsV2",
  "plural": false,
  "selections": (v35/*: any*/),
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
      (v32/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelAuditLogTypeCountsQuery",
    "selections": [
      {
        "condition": "k0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v36/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v37/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v38/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v39/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v40/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v41/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v42/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v43/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k8On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v44/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k9On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v45/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k10On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v46/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k11On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v47/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k12On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v48/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k13On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v49/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k14On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v50/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "k15On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v51/*: any*/),
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
      (v32/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
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
      (v14/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceChartPanelAuditLogTypeCountsQuery",
    "selections": [
      {
        "condition": "k0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v36/*: any*/)
        ]
      },
      {
        "condition": "k1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v37/*: any*/)
        ]
      },
      {
        "condition": "k2On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v38/*: any*/)
        ]
      },
      {
        "condition": "k3On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v39/*: any*/)
        ]
      },
      {
        "condition": "k4On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v40/*: any*/)
        ]
      },
      {
        "condition": "k5On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v41/*: any*/)
        ]
      },
      {
        "condition": "k6On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v42/*: any*/)
        ]
      },
      {
        "condition": "k7On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v43/*: any*/)
        ]
      },
      {
        "condition": "k8On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v44/*: any*/)
        ]
      },
      {
        "condition": "k9On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v45/*: any*/)
        ]
      },
      {
        "condition": "k10On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v46/*: any*/)
        ]
      },
      {
        "condition": "k11On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v47/*: any*/)
        ]
      },
      {
        "condition": "k12On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v48/*: any*/)
        ]
      },
      {
        "condition": "k13On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v49/*: any*/)
        ]
      },
      {
        "condition": "k14On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v50/*: any*/)
        ]
      },
      {
        "condition": "k15On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v51/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "46a68796a0ae50b6bd7029b5824e57e4",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelAuditLogTypeCountsQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelAuditLogTypeCountsQuery(\n  $scope: AuditLogScope!\n  $k0: AuditLogFilter\n  $k0On: Boolean!\n  $k1: AuditLogFilter\n  $k1On: Boolean!\n  $k2: AuditLogFilter\n  $k2On: Boolean!\n  $k3: AuditLogFilter\n  $k3On: Boolean!\n  $k4: AuditLogFilter\n  $k4On: Boolean!\n  $k5: AuditLogFilter\n  $k5On: Boolean!\n  $k6: AuditLogFilter\n  $k6On: Boolean!\n  $k7: AuditLogFilter\n  $k7On: Boolean!\n  $k8: AuditLogFilter\n  $k8On: Boolean!\n  $k9: AuditLogFilter\n  $k9On: Boolean!\n  $k10: AuditLogFilter\n  $k10On: Boolean!\n  $k11: AuditLogFilter\n  $k11On: Boolean!\n  $k12: AuditLogFilter\n  $k12On: Boolean!\n  $k13: AuditLogFilter\n  $k13On: Boolean!\n  $k14: AuditLogFilter\n  $k14On: Boolean!\n  $k15: AuditLogFilter\n  $k15On: Boolean!\n) {\n  k0: scopedAuditLogsV2(scope: $scope, filter: $k0, limit: 1) @include(if: $k0On) {\n    count\n  }\n  k1: scopedAuditLogsV2(scope: $scope, filter: $k1, limit: 1) @include(if: $k1On) {\n    count\n  }\n  k2: scopedAuditLogsV2(scope: $scope, filter: $k2, limit: 1) @include(if: $k2On) {\n    count\n  }\n  k3: scopedAuditLogsV2(scope: $scope, filter: $k3, limit: 1) @include(if: $k3On) {\n    count\n  }\n  k4: scopedAuditLogsV2(scope: $scope, filter: $k4, limit: 1) @include(if: $k4On) {\n    count\n  }\n  k5: scopedAuditLogsV2(scope: $scope, filter: $k5, limit: 1) @include(if: $k5On) {\n    count\n  }\n  k6: scopedAuditLogsV2(scope: $scope, filter: $k6, limit: 1) @include(if: $k6On) {\n    count\n  }\n  k7: scopedAuditLogsV2(scope: $scope, filter: $k7, limit: 1) @include(if: $k7On) {\n    count\n  }\n  k8: scopedAuditLogsV2(scope: $scope, filter: $k8, limit: 1) @include(if: $k8On) {\n    count\n  }\n  k9: scopedAuditLogsV2(scope: $scope, filter: $k9, limit: 1) @include(if: $k9On) {\n    count\n  }\n  k10: scopedAuditLogsV2(scope: $scope, filter: $k10, limit: 1) @include(if: $k10On) {\n    count\n  }\n  k11: scopedAuditLogsV2(scope: $scope, filter: $k11, limit: 1) @include(if: $k11On) {\n    count\n  }\n  k12: scopedAuditLogsV2(scope: $scope, filter: $k12, limit: 1) @include(if: $k12On) {\n    count\n  }\n  k13: scopedAuditLogsV2(scope: $scope, filter: $k13, limit: 1) @include(if: $k13On) {\n    count\n  }\n  k14: scopedAuditLogsV2(scope: $scope, filter: $k14, limit: 1) @include(if: $k14On) {\n    count\n  }\n  k15: scopedAuditLogsV2(scope: $scope, filter: $k15, limit: 1) @include(if: $k15On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "605c4ef2d80eb4a089807fe9b1514d0b";

export default node;
