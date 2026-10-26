/**
 * @generated SignedSource<<d2b0a56cee2238f84019d214b87d5c4a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
export type FailedOperationsPanelQuery$variables = {
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
  previousFailure: AuditLogFilter;
  scope: AuditLogScope;
};
export type FailedOperationsPanelQuery$data = {
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
};
export type FailedOperationsPanelQuery = {
  response: FailedOperationsPanelQuery$data;
  variables: FailedOperationsPanelQuery$variables;
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
  "name": "scope"
},
v19 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v20 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v21 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v22 = [
  {
    "alias": "failure",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "failure"
      },
      (v19/*: any*/),
      (v20/*: any*/)
    ],
    "concreteType": "AuditLogV2Connection",
    "kind": "LinkedField",
    "name": "scopedAuditLogsV2",
    "plural": false,
    "selections": (v21/*: any*/),
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
      (v19/*: any*/),
      (v20/*: any*/)
    ],
    "concreteType": "AuditLogV2Connection",
    "kind": "LinkedField",
    "name": "scopedAuditLogsV2",
    "plural": false,
    "selections": (v21/*: any*/),
    "storageKey": null
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
          (v19/*: any*/),
          (v20/*: any*/)
        ],
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "scopedAuditLogsV2",
        "plural": false,
        "selections": (v21/*: any*/),
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
      (v18/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FailedOperationsPanelQuery",
    "selections": (v22/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v18/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
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
    "name": "FailedOperationsPanelQuery",
    "selections": (v22/*: any*/)
  },
  "params": {
    "cacheID": "38ca5c08643a043820595cb3197a1222",
    "id": null,
    "metadata": {},
    "name": "FailedOperationsPanelQuery",
    "operationKind": "query",
    "text": "query FailedOperationsPanelQuery(\n  $scope: AuditLogScope!\n  $failure: AuditLogFilter!\n  $previousFailure: AuditLogFilter!\n  $f0: AuditLogFilter\n  $f0On: Boolean!\n  $f1: AuditLogFilter\n  $f1On: Boolean!\n  $f2: AuditLogFilter\n  $f2On: Boolean!\n  $f3: AuditLogFilter\n  $f3On: Boolean!\n  $f4: AuditLogFilter\n  $f4On: Boolean!\n  $f5: AuditLogFilter\n  $f5On: Boolean!\n  $f6: AuditLogFilter\n  $f6On: Boolean!\n  $f7: AuditLogFilter\n  $f7On: Boolean!\n) {\n  failure: scopedAuditLogsV2(scope: $scope, filter: $failure, limit: 1) {\n    count\n  }\n  previousFailure: scopedAuditLogsV2(scope: $scope, filter: $previousFailure, limit: 1) {\n    count\n  }\n  f0: scopedAuditLogsV2(scope: $scope, filter: $f0, limit: 1) @include(if: $f0On) {\n    count\n  }\n  f1: scopedAuditLogsV2(scope: $scope, filter: $f1, limit: 1) @include(if: $f1On) {\n    count\n  }\n  f2: scopedAuditLogsV2(scope: $scope, filter: $f2, limit: 1) @include(if: $f2On) {\n    count\n  }\n  f3: scopedAuditLogsV2(scope: $scope, filter: $f3, limit: 1) @include(if: $f3On) {\n    count\n  }\n  f4: scopedAuditLogsV2(scope: $scope, filter: $f4, limit: 1) @include(if: $f4On) {\n    count\n  }\n  f5: scopedAuditLogsV2(scope: $scope, filter: $f5, limit: 1) @include(if: $f5On) {\n    count\n  }\n  f6: scopedAuditLogsV2(scope: $scope, filter: $f6, limit: 1) @include(if: $f6On) {\n    count\n  }\n  f7: scopedAuditLogsV2(scope: $scope, filter: $f7, limit: 1) @include(if: $f7On) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "b8d471046abba96868c2626089918aab";

export default node;
