/**
 * @generated SignedSource<<e7c14a6c6a0f91047f3d4d606fb5ce0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionV2NetworkType = "HOST" | "PERSISTENT" | "VOLATILE" | "%future added value";
export type SessionV2Result = "FAILURE" | "SUCCESS" | "UNDEFINED" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RESERVED" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type SessionV2Filter = {
  AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
  NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
  OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  batchTimeout?: IntFilter | null | undefined;
  clusterSize?: IntFilter | null | undefined;
  creationId?: StringFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isPreemptible?: boolean | null | undefined;
  jobPriority?: IntFilter | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  networkId?: StringFilter | null | undefined;
  networkType?: SessionV2NetworkTypeFilter | null | undefined;
  priority?: IntFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  replicaId?: UUIDFilter | null | undefined;
  resourceGroupName?: StringFilter | null | undefined;
  result?: SessionV2ResultFilter | null | undefined;
  sessionType?: SessionV2TypeFilter | null | undefined;
  startsAt?: DateTimeFilter | null | undefined;
  status?: SessionV2StatusFilter | null | undefined;
  tag?: StringFilter | null | undefined;
  terminatedAt?: DateTimeFilter | null | undefined;
  tier?: IntFilter | null | undefined;
  useHostNetwork?: boolean | null | undefined;
  userUuid?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type SessionV2StatusFilter = {
  equals?: SessionV2Status | null | undefined;
  in?: ReadonlyArray<SessionV2Status> | null | undefined;
  notEquals?: SessionV2Status | null | undefined;
  notIn?: ReadonlyArray<SessionV2Status> | null | undefined;
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
export type SessionV2TypeFilter = {
  equals?: SessionV2Type | null | undefined;
  in?: ReadonlyArray<SessionV2Type> | null | undefined;
  notEquals?: SessionV2Type | null | undefined;
  notIn?: ReadonlyArray<SessionV2Type> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type SessionV2ResultFilter = {
  equals?: SessionV2Result | null | undefined;
  in?: ReadonlyArray<SessionV2Result> | null | undefined;
  notEquals?: SessionV2Result | null | undefined;
  notIn?: ReadonlyArray<SessionV2Result> | null | undefined;
};
export type SessionV2NetworkTypeFilter = {
  equals?: SessionV2NetworkType | null | undefined;
  in?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
  notEquals?: SessionV2NetworkType | null | undefined;
  notIn?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
};
export type SessionResultPanelQuery$variables = {
  f0?: SessionV2Filter | null | undefined;
  f0On: boolean;
  f1?: SessionV2Filter | null | undefined;
  f1On: boolean;
  f2?: SessionV2Filter | null | undefined;
  f2On: boolean;
  f3?: SessionV2Filter | null | undefined;
  f3On: boolean;
  f4?: SessionV2Filter | null | undefined;
  f4On: boolean;
  f5?: SessionV2Filter | null | undefined;
  f5On: boolean;
  f6?: SessionV2Filter | null | undefined;
  f6On: boolean;
  f7?: SessionV2Filter | null | undefined;
  f7On: boolean;
  failure: SessionV2Filter;
  previousFailure: SessionV2Filter;
  previousSuccess: SessionV2Filter;
  s0?: SessionV2Filter | null | undefined;
  s0On: boolean;
  s1?: SessionV2Filter | null | undefined;
  s1On: boolean;
  s2?: SessionV2Filter | null | undefined;
  s2On: boolean;
  s3?: SessionV2Filter | null | undefined;
  s3On: boolean;
  s4?: SessionV2Filter | null | undefined;
  s4On: boolean;
  s5?: SessionV2Filter | null | undefined;
  s5On: boolean;
  s6?: SessionV2Filter | null | undefined;
  s6On: boolean;
  s7?: SessionV2Filter | null | undefined;
  s7On: boolean;
  success: SessionV2Filter;
};
export type SessionResultPanelQuery$data = {
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
export type SessionResultPanelQuery = {
  response: SessionResultPanelQuery$data;
  variables: SessionResultPanelQuery$variables;
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
  "name": "previousFailure"
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
  "name": "success"
},
v36 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v37 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v38 = [
  {
    "alias": "success",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "success"
      },
      (v36/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "mySessionsV2",
    "plural": false,
    "selections": (v37/*: any*/),
    "storageKey": null
  },
  {
    "alias": "failure",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "failure"
      },
      (v36/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "mySessionsV2",
    "plural": false,
    "selections": (v37/*: any*/),
    "storageKey": null
  },
  {
    "alias": "previousSuccess",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "previousSuccess"
      },
      (v36/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "mySessionsV2",
    "plural": false,
    "selections": (v37/*: any*/),
    "storageKey": null
  },
  {
    "alias": "previousFailure",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "previousFailure"
      },
      (v36/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "mySessionsV2",
    "plural": false,
    "selections": (v37/*: any*/),
    "storageKey": null
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
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
          (v36/*: any*/)
        ],
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "mySessionsV2",
        "plural": false,
        "selections": (v37/*: any*/),
        "storageKey": null
      }
    ]
  }
];
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
    "name": "SessionResultPanelQuery",
    "selections": (v38/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v35/*: any*/),
      (v16/*: any*/),
      (v18/*: any*/),
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
    "name": "SessionResultPanelQuery",
    "selections": (v38/*: any*/)
  },
  "params": {
    "cacheID": "e42a42504973d780f19fb8a9f6d41f7c",
    "id": null,
    "metadata": {},
    "name": "SessionResultPanelQuery",
    "operationKind": "query",
    "text": "query SessionResultPanelQuery(\n  $success: SessionV2Filter!\n  $failure: SessionV2Filter!\n  $previousSuccess: SessionV2Filter!\n  $previousFailure: SessionV2Filter!\n  $s0: SessionV2Filter\n  $s0On: Boolean!\n  $s1: SessionV2Filter\n  $s1On: Boolean!\n  $s2: SessionV2Filter\n  $s2On: Boolean!\n  $s3: SessionV2Filter\n  $s3On: Boolean!\n  $s4: SessionV2Filter\n  $s4On: Boolean!\n  $s5: SessionV2Filter\n  $s5On: Boolean!\n  $s6: SessionV2Filter\n  $s6On: Boolean!\n  $s7: SessionV2Filter\n  $s7On: Boolean!\n  $f0: SessionV2Filter\n  $f0On: Boolean!\n  $f1: SessionV2Filter\n  $f1On: Boolean!\n  $f2: SessionV2Filter\n  $f2On: Boolean!\n  $f3: SessionV2Filter\n  $f3On: Boolean!\n  $f4: SessionV2Filter\n  $f4On: Boolean!\n  $f5: SessionV2Filter\n  $f5On: Boolean!\n  $f6: SessionV2Filter\n  $f6On: Boolean!\n  $f7: SessionV2Filter\n  $f7On: Boolean!\n) {\n  success: mySessionsV2(filter: $success, limit: 1) {\n    count\n  }\n  failure: mySessionsV2(filter: $failure, limit: 1) {\n    count\n  }\n  previousSuccess: mySessionsV2(filter: $previousSuccess, limit: 1) {\n    count\n  }\n  previousFailure: mySessionsV2(filter: $previousFailure, limit: 1) {\n    count\n  }\n  s0: mySessionsV2(filter: $s0, limit: 1) @include(if: $s0On) {\n    count\n  }\n  s1: mySessionsV2(filter: $s1, limit: 1) @include(if: $s1On) {\n    count\n  }\n  s2: mySessionsV2(filter: $s2, limit: 1) @include(if: $s2On) {\n    count\n  }\n  s3: mySessionsV2(filter: $s3, limit: 1) @include(if: $s3On) {\n    count\n  }\n  s4: mySessionsV2(filter: $s4, limit: 1) @include(if: $s4On) {\n    count\n  }\n  s5: mySessionsV2(filter: $s5, limit: 1) @include(if: $s5On) {\n    count\n  }\n  s6: mySessionsV2(filter: $s6, limit: 1) @include(if: $s6On) {\n    count\n  }\n  s7: mySessionsV2(filter: $s7, limit: 1) @include(if: $s7On) {\n    count\n  }\n  f0: mySessionsV2(filter: $f0, limit: 1) @include(if: $f0On) {\n    count\n  }\n  f1: mySessionsV2(filter: $f1, limit: 1) @include(if: $f1On) {\n    count\n  }\n  f2: mySessionsV2(filter: $f2, limit: 1) @include(if: $f2On) {\n    count\n  }\n  f3: mySessionsV2(filter: $f3, limit: 1) @include(if: $f3On) {\n    count\n  }\n  f4: mySessionsV2(filter: $f4, limit: 1) @include(if: $f4On) {\n    count\n  }\n  f5: mySessionsV2(filter: $f5, limit: 1) @include(if: $f5On) {\n    count\n  }\n  f6: mySessionsV2(filter: $f6, limit: 1) @include(if: $f6On) {\n    count\n  }\n  f7: mySessionsV2(filter: $f7, limit: 1) @include(if: $f7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "7ccf520d33f1157313e3d472399ab003";

export default node;
