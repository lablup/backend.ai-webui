/**
 * @generated SignedSource<<665f24a61d7dc252b7c8dbe9133a4882>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
export type NotificationChannelFilter = {
  AND?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  NOT?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  OR?: ReadonlyArray<NotificationChannelFilter> | null | undefined;
  channelType?: NotificationChannelTypeFilter | null | undefined;
  enabled?: boolean | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  name?: StringFilter | null | undefined;
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
export type NotificationChannelTypeFilter = {
  equals?: NotificationChannelType | null | undefined;
  in?: ReadonlyArray<NotificationChannelType> | null | undefined;
  notEquals?: NotificationChannelType | null | undefined;
  notIn?: ReadonlyArray<NotificationChannelType> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type NotificationChannelSelectPaginatedQuery$variables = {
  filter?: NotificationChannelFilter | null | undefined;
  limit: number;
  offset: number;
};
export type NotificationChannelSelectPaginatedQuery$data = {
  readonly adminNotificationChannels: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly channelType: NotificationChannelType;
        readonly entityId: string;
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type NotificationChannelSelectPaginatedQuery = {
  response: NotificationChannelSelectPaginatedQuery$data;
  variables: NotificationChannelSelectPaginatedQuery$variables;
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
  "name": "offset"
},
v3 = [
  {
    "alias": null,
    "args": [
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
            "direction": "ASC",
            "field": "NAME"
          }
        ]
      }
    ],
    "concreteType": "NotificationChannelConnection",
    "kind": "LinkedField",
    "name": "adminNotificationChannels",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationChannelEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationChannel",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
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
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "channelType",
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationChannelSelectPaginatedQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "NotificationChannelSelectPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "4b6709a0bad08d177fcf3ad307cda36f",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query NotificationChannelSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: NotificationChannelFilter\n) {\n  adminNotificationChannels(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        name\n        channelType\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c44a5d9f5e3d7a3274f0b014d0cf48b7";

export default node;
