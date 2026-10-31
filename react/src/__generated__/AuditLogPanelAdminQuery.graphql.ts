/**
 * @generated SignedSource<<c30cc1fa7628a3d1c418d0892bde050d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
  filter: AuditLogFilter;
  limit: number;
  live0On: boolean;
  live1On: boolean;
  liveF0?: AuditLogFilter | null | undefined;
  liveF1?: AuditLogFilter | null | undefined;
  liveS0?: AuditLogFilter | null | undefined;
  liveS1?: AuditLogFilter | null | undefined;
  offset: number;
  previousFailure?: AuditLogFilter | null | undefined;
  previousOn: boolean;
  previousSuccess?: AuditLogFilter | null | undefined;
};
export type AuditLogPanelAdminQuery$data = {
  readonly liveF0?: {
    readonly count: number;
  } | null | undefined;
  readonly liveF1?: {
    readonly count: number;
  } | null | undefined;
  readonly liveS0?: {
    readonly count: number;
  } | null | undefined;
  readonly liveS1?: {
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
  readonly previousFailure?: {
    readonly count: number;
  } | null | undefined;
  readonly previousSuccess?: {
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
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "live0On"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "live1On"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveF0"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveF1"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveS0"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liveS1"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousFailure"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousOn"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "previousSuccess"
},
v12 = [
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
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v14 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v15 = [
  (v13/*: any*/)
],
v16 = {
  "alias": "previousSuccess",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousSuccess"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": "previousFailure",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "previousFailure"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v18 = {
  "alias": "liveS0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS0"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v19 = {
  "alias": "liveF0",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF0"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v20 = {
  "alias": "liveS1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveS1"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v21 = {
  "alias": "liveF1",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "liveF1"
    },
    (v14/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
      (v11/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "alias": "logs",
        "args": (v12/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          (v13/*: any*/),
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
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v16/*: any*/),
            "to": "NULL"
          },
          {
            "kind": "CatchField",
            "field": (v17/*: any*/),
            "to": "NULL"
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
            "field": (v18/*: any*/),
            "to": "NULL"
          },
          {
            "kind": "CatchField",
            "field": (v19/*: any*/),
            "to": "NULL"
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
            "field": (v20/*: any*/),
            "to": "NULL"
          },
          {
            "kind": "CatchField",
            "field": (v21/*: any*/),
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
      (v0/*: any*/),
      (v1/*: any*/),
      (v8/*: any*/),
      (v11/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v6/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v7/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "AuditLogPanelAdminQuery",
    "selections": [
      {
        "alias": "logs",
        "args": (v12/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          (v13/*: any*/),
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
                  (v22/*: any*/),
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
                    "name": "actionName",
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "targetEntityId",
                    "storageKey": null
                  },
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
                      (v22/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "entityId",
                        "storageKey": null
                      },
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
      {
        "condition": "previousOn",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v16/*: any*/),
          (v17/*: any*/)
        ]
      },
      {
        "condition": "live0On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v18/*: any*/),
          (v19/*: any*/)
        ]
      },
      {
        "condition": "live1On",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v20/*: any*/),
          (v21/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d4c78a3b05abc7813db7c829a51147b4",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelAdminQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelAdminQuery(\n  $filter: AuditLogFilter!\n  $limit: Int!\n  $offset: Int!\n  $previousSuccess: AuditLogFilter\n  $previousFailure: AuditLogFilter\n  $previousOn: Boolean!\n  $liveS0: AuditLogFilter\n  $liveF0: AuditLogFilter\n  $live0On: Boolean!\n  $liveS1: AuditLogFilter\n  $liveF1: AuditLogFilter\n  $live1On: Boolean!\n) {\n  logs: adminAuditLogsV2(filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAIAuditLogNodesFragment\n        id\n      }\n    }\n  }\n  previousSuccess: adminAuditLogsV2(filter: $previousSuccess, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  previousFailure: adminAuditLogsV2(filter: $previousFailure, limit: 1) @include(if: $previousOn) {\n    count\n  }\n  liveS0: adminAuditLogsV2(filter: $liveS0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveF0: adminAuditLogsV2(filter: $liveF0, limit: 1) @include(if: $live0On) {\n    count\n  }\n  liveS1: adminAuditLogsV2(filter: $liveS1, limit: 1) @include(if: $live1On) {\n    count\n  }\n  liveF1: adminAuditLogsV2(filter: $liveF1, limit: 1) @include(if: $live1On) {\n    count\n  }\n}\n\nfragment BAIAuditLogNodesFragment on AuditLogV2 {\n  id\n  createdAt\n  actionName\n  operation\n  status\n  description\n  duration\n  requestId\n  actionId\n  entityType\n  targetEntityId\n  triggeredBy\n  clientIp @since(version: \"26.9.0\")\n  user {\n    id\n    entityId\n    basicInfo {\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "16312e0e2c4af5cee8e77daa9011879a";

export default node;
