/**
 * @generated SignedSource<<930d98d5a8e773af0e045efbc30a3e25>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AuditLogStatus = "DENIED" | "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
export type AuditLogFilter = {
  AND?: ReadonlyArray<AuditLogFilter> | null | undefined;
  NOT?: ReadonlyArray<AuditLogFilter> | null | undefined;
  OR?: ReadonlyArray<AuditLogFilter> | null | undefined;
  actedAs?: UUIDFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: StringFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  operation?: StringFilter | null | undefined;
  status?: AuditLogStatusFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type AuditLogPanelAdminQuery$variables = {
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
  failure: AuditLogFilter;
  filter: AuditLogFilter;
  limit: number;
  offset: number;
  previousFailure: AuditLogFilter;
  previousSuccess: AuditLogFilter;
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
  success: AuditLogFilter;
};
export type AuditLogPanelAdminQuery$data = {
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
  readonly failure: {
    readonly count: number;
  } | null | undefined;
  readonly logs: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogNodesFragment">;
      };
    }>;
  } | null | undefined;
  readonly previousFailure: {
    readonly count: number;
  } | null | undefined;
  readonly previousSuccess: {
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
  readonly success: {
    readonly count: number;
  } | null | undefined;
};
export type AuditLogPanelAdminQuery = {
  response: AuditLogPanelAdminQuery$data;
  variables: AuditLogPanelAdminQuery$variables;
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
  "name": "failure"
},
v17 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v18 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v19 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v20 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFailure"
},
v21 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousSuccess"
},
v22 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s0"
},
v23 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s0On"
},
v24 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s1"
},
v25 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s1On"
},
v26 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s2"
},
v27 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s2On"
},
v28 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s3"
},
v29 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s3On"
},
v30 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s4"
},
v31 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s4On"
},
v32 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s5"
},
v33 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s5On"
},
v34 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s6"
},
v35 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s6On"
},
v36 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s7"
},
v37 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "s7On"
},
v38 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "success"
},
v39 = [
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
  }
],
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v41 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v42 = [
  (v40/*: any*/)
],
v43 = {
  "alias": "success",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "success"
    },
    (v41/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v42/*: any*/),
  "storageKey": null
},
v44 = {
  "alias": "failure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "failure"
    },
    (v41/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v42/*: any*/),
  "storageKey": null
},
v45 = {
  "alias": "previousSuccess",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousSuccess"
    },
    (v41/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v42/*: any*/),
  "storageKey": null
},
v46 = {
  "alias": "previousFailure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailure"
    },
    (v41/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v42/*: any*/),
  "storageKey": null
},
v47 = {
  "condition": "s0On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s0",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s0"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v48 = {
  "condition": "s1On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s1",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s1"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v49 = {
  "condition": "s2On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s2",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s2"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v50 = {
  "condition": "s3On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s3",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s3"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v51 = {
  "condition": "s4On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s4",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s4"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v52 = {
  "condition": "s5On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s5",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s5"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v53 = {
  "condition": "s6On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s6",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s6"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v54 = {
  "condition": "s7On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "s7",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "s7"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v55 = {
  "condition": "f0On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f0",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f0"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v56 = {
  "condition": "f1On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f1",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f1"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v57 = {
  "condition": "f2On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f2",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f2"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v58 = {
  "condition": "f3On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f3",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f3"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v59 = {
  "condition": "f4On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f4",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f4"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v60 = {
  "condition": "f5On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f5",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f5"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v61 = {
  "condition": "f6On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f6",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f6"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v62 = {
  "condition": "f7On",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "f7",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "f7"
        },
        (v41/*: any*/)
      ],
      "concreteType": "AuditLogV2Connection",
      "kind": "LinkedField",
      "name": "adminAuditLogsV2",
      "plural": false,
      "selections": (v42/*: any*/),
      "storageKey": null
    }
  ]
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
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
      (v35/*: any*/),
      (v36/*: any*/),
      (v37/*: any*/),
      (v38/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "alias": "logs",
        "args": (v39/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          (v40/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "AuditLogV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AuditLogV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIAuditLogNodesFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v43/*: any*/),
      (v44/*: any*/),
      (v45/*: any*/),
      (v46/*: any*/),
      (v47/*: any*/),
      (v48/*: any*/),
      (v49/*: any*/),
      (v50/*: any*/),
      (v51/*: any*/),
      (v52/*: any*/),
      (v53/*: any*/),
      (v54/*: any*/),
      (v55/*: any*/),
      (v56/*: any*/),
      (v57/*: any*/),
      (v58/*: any*/),
      (v59/*: any*/),
      (v60/*: any*/),
      (v61/*: any*/),
      (v62/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/),
      (v38/*: any*/),
      (v16/*: any*/),
      (v21/*: any*/),
      (v20/*: any*/),
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
      (v35/*: any*/),
      (v36/*: any*/),
      (v37/*: any*/),
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
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "alias": "logs",
        "args": (v39/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          (v40/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "AuditLogV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AuditLogV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v63/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "operation",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "duration",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "requestId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "actionId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entityType",
                    "storageKey": null
                  },
                  (v64/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "triggeredBy",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clientIp",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v63/*: any*/),
                      (v64/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "UserV2BasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "email",
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v43/*: any*/),
      (v44/*: any*/),
      (v45/*: any*/),
      (v46/*: any*/),
      (v47/*: any*/),
      (v48/*: any*/),
      (v49/*: any*/),
      (v50/*: any*/),
      (v51/*: any*/),
      (v52/*: any*/),
      (v53/*: any*/),
      (v54/*: any*/),
      (v55/*: any*/),
      (v56/*: any*/),
      (v57/*: any*/),
      (v58/*: any*/),
      (v59/*: any*/),
      (v60/*: any*/),
      (v61/*: any*/),
      (v62/*: any*/)
    ]
  },
  "params": {
    "cacheID": "a2e55440362abab8a8bb239e6d6350fe",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelAdminQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelAdminQuery(\n  $filter: AuditLogFilter!\n  $limit: Int!\n  $offset: Int!\n  $success: AuditLogFilter!\n  $failure: AuditLogFilter!\n  $previousSuccess: AuditLogFilter!\n  $previousFailure: AuditLogFilter!\n  $s0: AuditLogFilter\n  $s0On: Boolean!\n  $s1: AuditLogFilter\n  $s1On: Boolean!\n  $s2: AuditLogFilter\n  $s2On: Boolean!\n  $s3: AuditLogFilter\n  $s3On: Boolean!\n  $s4: AuditLogFilter\n  $s4On: Boolean!\n  $s5: AuditLogFilter\n  $s5On: Boolean!\n  $s6: AuditLogFilter\n  $s6On: Boolean!\n  $s7: AuditLogFilter\n  $s7On: Boolean!\n  $f0: AuditLogFilter\n  $f0On: Boolean!\n  $f1: AuditLogFilter\n  $f1On: Boolean!\n  $f2: AuditLogFilter\n  $f2On: Boolean!\n  $f3: AuditLogFilter\n  $f3On: Boolean!\n  $f4: AuditLogFilter\n  $f4On: Boolean!\n  $f5: AuditLogFilter\n  $f5On: Boolean!\n  $f6: AuditLogFilter\n  $f6On: Boolean!\n  $f7: AuditLogFilter\n  $f7On: Boolean!\n) {\n  logs: adminAuditLogsV2(filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAIAuditLogNodesFragment\n        id\n      }\n    }\n  }\n  success: adminAuditLogsV2(filter: $success, limit: 1) {\n    count\n  }\n  failure: adminAuditLogsV2(filter: $failure, limit: 1) {\n    count\n  }\n  previousSuccess: adminAuditLogsV2(filter: $previousSuccess, limit: 1) {\n    count\n  }\n  previousFailure: adminAuditLogsV2(filter: $previousFailure, limit: 1) {\n    count\n  }\n  s0: adminAuditLogsV2(filter: $s0, limit: 1) @include(if: $s0On) {\n    count\n  }\n  s1: adminAuditLogsV2(filter: $s1, limit: 1) @include(if: $s1On) {\n    count\n  }\n  s2: adminAuditLogsV2(filter: $s2, limit: 1) @include(if: $s2On) {\n    count\n  }\n  s3: adminAuditLogsV2(filter: $s3, limit: 1) @include(if: $s3On) {\n    count\n  }\n  s4: adminAuditLogsV2(filter: $s4, limit: 1) @include(if: $s4On) {\n    count\n  }\n  s5: adminAuditLogsV2(filter: $s5, limit: 1) @include(if: $s5On) {\n    count\n  }\n  s6: adminAuditLogsV2(filter: $s6, limit: 1) @include(if: $s6On) {\n    count\n  }\n  s7: adminAuditLogsV2(filter: $s7, limit: 1) @include(if: $s7On) {\n    count\n  }\n  f0: adminAuditLogsV2(filter: $f0, limit: 1) @include(if: $f0On) {\n    count\n  }\n  f1: adminAuditLogsV2(filter: $f1, limit: 1) @include(if: $f1On) {\n    count\n  }\n  f2: adminAuditLogsV2(filter: $f2, limit: 1) @include(if: $f2On) {\n    count\n  }\n  f3: adminAuditLogsV2(filter: $f3, limit: 1) @include(if: $f3On) {\n    count\n  }\n  f4: adminAuditLogsV2(filter: $f4, limit: 1) @include(if: $f4On) {\n    count\n  }\n  f5: adminAuditLogsV2(filter: $f5, limit: 1) @include(if: $f5On) {\n    count\n  }\n  f6: adminAuditLogsV2(filter: $f6, limit: 1) @include(if: $f6On) {\n    count\n  }\n  f7: adminAuditLogsV2(filter: $f7, limit: 1) @include(if: $f7On) {\n    count\n  }\n}\n\nfragment BAIAuditLogNodesFragment on AuditLogV2 {\n  id\n  createdAt\n  operation\n  status\n  description\n  duration\n  requestId\n  actionId\n  entityType\n  entityId\n  triggeredBy\n  clientIp @since(version: \"26.9.0\")\n  user {\n    id\n    entityId\n    basicInfo {\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b7135758c6cf598f209f6e119dff6628";

export default node;
