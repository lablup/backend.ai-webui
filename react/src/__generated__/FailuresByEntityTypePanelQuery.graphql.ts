/**
 * @generated SignedSource<<dc1ed9af810f4f6ffab38794447f6c03>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
export type FailuresByEntityTypePanelQuery$variables = {
  artifactRegistry: AuditLogFilter;
  deployment: AuditLogFilter;
  other: AuditLogFilter;
  project: AuditLogFilter;
  resourceGroup: AuditLogFilter;
  session: AuditLogFilter;
  user: AuditLogFilter;
  vfolder: AuditLogFilter;
};
export type FailuresByEntityTypePanelQuery$data = {
  readonly artifactRegistry: {
    readonly count: number;
  } | null | undefined;
  readonly deployment: {
    readonly count: number;
  } | null | undefined;
  readonly other: {
    readonly count: number;
  } | null | undefined;
  readonly project: {
    readonly count: number;
  } | null | undefined;
  readonly resourceGroup: {
    readonly count: number;
  } | null | undefined;
  readonly session: {
    readonly count: number;
  } | null | undefined;
  readonly user: {
    readonly count: number;
  } | null | undefined;
  readonly vfolder: {
    readonly count: number;
  } | null | undefined;
};
export type FailuresByEntityTypePanelQuery = {
  response: FailuresByEntityTypePanelQuery$data;
  variables: FailuresByEntityTypePanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "artifactRegistry"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deployment"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "other"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "session"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolder"
},
v8 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v9 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v10 = {
  "alias": "session",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "session"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": "vfolder",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "vfolder"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": "deployment",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "deployment"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": "user",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "user"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": "project",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "project"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": "resourceGroup",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "resourceGroup"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": "artifactRegistry",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "artifactRegistry"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": "other",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "other"
    },
    (v8/*: any*/)
  ],
  "concreteType": "AuditLogV2Connection",
  "kind": "LinkedField",
  "name": "adminAuditLogsV2",
  "plural": false,
  "selections": (v9/*: any*/),
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
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FailuresByEntityTypePanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v10/*: any*/),
        "to": "NULL"
      },
      {
        "kind": "CatchField",
        "field": (v11/*: any*/),
        "to": "NULL"
      },
      {
        "kind": "CatchField",
        "field": (v12/*: any*/),
        "to": "NULL"
      },
      {
        "kind": "CatchField",
        "field": (v13/*: any*/),
        "to": "NULL"
      },
      {
        "kind": "CatchField",
        "field": (v14/*: any*/),
        "to": "NULL"
      },
      {
        "kind": "CatchField",
        "field": (v15/*: any*/),
        "to": "NULL"
      },
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v5/*: any*/),
      (v7/*: any*/),
      (v1/*: any*/),
      (v6/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "FailuresByEntityTypePanelQuery",
    "selections": [
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/)
    ]
  },
  "params": {
    "cacheID": "14d39fcdab768680c1dd5621434eff30",
    "id": null,
    "metadata": {},
    "name": "FailuresByEntityTypePanelQuery",
    "operationKind": "query",
    "text": "query FailuresByEntityTypePanelQuery(\n  $session: AuditLogFilter!\n  $vfolder: AuditLogFilter!\n  $deployment: AuditLogFilter!\n  $user: AuditLogFilter!\n  $project: AuditLogFilter!\n  $resourceGroup: AuditLogFilter!\n  $artifactRegistry: AuditLogFilter!\n  $other: AuditLogFilter!\n) {\n  session: adminAuditLogsV2(filter: $session, limit: 1) {\n    count\n  }\n  vfolder: adminAuditLogsV2(filter: $vfolder, limit: 1) {\n    count\n  }\n  deployment: adminAuditLogsV2(filter: $deployment, limit: 1) {\n    count\n  }\n  user: adminAuditLogsV2(filter: $user, limit: 1) {\n    count\n  }\n  project: adminAuditLogsV2(filter: $project, limit: 1) {\n    count\n  }\n  resourceGroup: adminAuditLogsV2(filter: $resourceGroup, limit: 1) {\n    count\n  }\n  artifactRegistry: adminAuditLogsV2(filter: $artifactRegistry, limit: 1) {\n    count\n  }\n  other: adminAuditLogsV2(filter: $other, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "7bbb51446bb1baaaa4e67c050670e846";

export default node;
