/**
 * @generated SignedSource<<3006a358db0eece54b269e37b0613593>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
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
export type AuditLogPanelAdminListQuery$variables = {
  filter: AuditLogFilter;
  limit: number;
  offset: number;
};
export type AuditLogPanelAdminListQuery$data = {
  readonly logs: Result<{
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogNodesFragment">;
      };
    }>;
  } | null | undefined, unknown>;
};
export type AuditLogPanelAdminListQuery = {
  response: AuditLogPanelAdminListQuery$data;
  variables: AuditLogPanelAdminListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelAdminListQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "logs",
          "args": (v1/*: any*/),
          "concreteType": "AuditLogV2Connection",
          "kind": "LinkedField",
          "name": "adminAuditLogsV2",
          "plural": false,
          "selections": [
            (v2/*: any*/),
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
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AuditLogPanelAdminListQuery",
    "selections": [
      {
        "alias": "logs",
        "args": (v1/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
                  (v3/*: any*/),
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
                      (v3/*: any*/),
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
      }
    ]
  },
  "params": {
    "cacheID": "0918c956d430ecea123e9633ae5f1ec7",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelAdminListQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelAdminListQuery(\n  $filter: AuditLogFilter!\n  $limit: Int!\n  $offset: Int!\n) {\n  logs: adminAuditLogsV2(filter: $filter, orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        ...BAIAuditLogNodesFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIAuditLogNodesFragment on AuditLogV2 {\n  id\n  createdAt\n  actionName\n  operation\n  status\n  description\n  duration\n  requestId\n  actionId\n  entityType\n  targetEntityId\n  triggeredBy\n  clientIp @since(version: \"26.9.0\")\n  user {\n    id\n    entityId\n    basicInfo {\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28e3a3e8e464b110fe1ddcca6a7266ec";

export default node;
