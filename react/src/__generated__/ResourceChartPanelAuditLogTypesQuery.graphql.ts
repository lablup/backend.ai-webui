/**
 * @generated SignedSource<<7b6088e417a565ed09a35782807876a7>>
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
export type ResourceChartPanelAuditLogTypesQuery$variables = {
  filter?: AuditLogFilter | null | undefined;
  limit: number;
  on: boolean;
  scope: AuditLogScope;
};
export type ResourceChartPanelAuditLogTypesQuery$data = {
  readonly entityTypes?: ReadonlyArray<{
    readonly name: string;
  }> | null | undefined;
  readonly newest?: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityType: string | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
  readonly oldest?: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityType: string | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
};
export type ResourceChartPanelAuditLogTypesQuery = {
  response: ResourceChartPanelAuditLogTypesQuery$data;
  variables: ResourceChartPanelAuditLogTypesQuery$variables;
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
  "name": "on"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v4 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v5 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v6 = {
  "kind": "Variable",
  "name": "scope",
  "variableName": "scope"
},
v7 = [
  (v4/*: any*/),
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "CREATED_AT"
      }
    ]
  },
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityType",
  "storageKey": null
},
v9 = [
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
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v10 = [
  (v4/*: any*/),
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "CREATED_AT"
      }
    ]
  },
  (v6/*: any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = [
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
          (v8/*: any*/),
          (v12/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceChartPanelAuditLogTypesQuery",
    "selections": [
      {
        "condition": "on",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "alias": "newest",
              "args": (v7/*: any*/),
              "concreteType": "AuditLogV2Connection",
              "kind": "LinkedField",
              "name": "scopedAuditLogsV2",
              "plural": false,
              "selections": (v9/*: any*/),
              "storageKey": null
            },
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": {
              "alias": "oldest",
              "args": (v10/*: any*/),
              "concreteType": "AuditLogV2Connection",
              "kind": "LinkedField",
              "name": "scopedAuditLogsV2",
              "plural": false,
              "selections": (v9/*: any*/),
              "storageKey": null
            },
            "to": "RESULT"
          },
          {
            "kind": "CatchField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "EntityType",
              "kind": "LinkedField",
              "name": "entityTypes",
              "plural": true,
              "selections": [
                (v11/*: any*/)
              ],
              "storageKey": null
            },
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
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourceChartPanelAuditLogTypesQuery",
    "selections": [
      {
        "condition": "on",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "newest",
            "args": (v7/*: any*/),
            "concreteType": "AuditLogV2Connection",
            "kind": "LinkedField",
            "name": "scopedAuditLogsV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          },
          {
            "alias": "oldest",
            "args": (v10/*: any*/),
            "concreteType": "AuditLogV2Connection",
            "kind": "LinkedField",
            "name": "scopedAuditLogsV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityType",
            "kind": "LinkedField",
            "name": "entityTypes",
            "plural": true,
            "selections": [
              (v11/*: any*/),
              (v12/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "569b21e2a3766fcda516bfeccb69dac4",
    "id": null,
    "metadata": {},
    "name": "ResourceChartPanelAuditLogTypesQuery",
    "operationKind": "query",
    "text": "query ResourceChartPanelAuditLogTypesQuery(\n  $scope: AuditLogScope!\n  $filter: AuditLogFilter\n  $limit: Int!\n  $on: Boolean!\n) {\n  newest: scopedAuditLogsV2(scope: $scope, filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit) @include(if: $on) {\n    edges {\n      node {\n        entityType\n        id\n      }\n    }\n  }\n  oldest: scopedAuditLogsV2(scope: $scope, filter: $filter, orderBy: [{field: CREATED_AT, direction: ASC}], limit: $limit) @include(if: $on) {\n    edges {\n      node {\n        entityType\n        id\n      }\n    }\n  }\n  entityTypes @include(if: $on) {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "53db60e94b3058b53d9e0ad3506a791f";

export default node;
