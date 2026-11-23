/**
 * @generated SignedSource<<444dcd9faf45e42ce13674e66a7e2e3a>>
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
export type NotificationRuleListChannelsQuery$variables = {
  filter?: NotificationChannelFilter | null | undefined;
  limit?: number | null | undefined;
};
export type NotificationRuleListChannelsQuery$data = {
  readonly adminNotificationChannels: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly enabled: boolean;
        readonly entityId: string;
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type NotificationRuleListChannelsQuery = {
  response: NotificationRuleListChannelsQuery$data;
  variables: NotificationRuleListChannelsQuery$variables;
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
  }
],
v1 = [
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
                "name": "enabled",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationRuleListChannelsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleListChannelsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a65de7cd5f5e328f3eb781aca31fb56e",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleListChannelsQuery",
    "operationKind": "query",
    "text": "query NotificationRuleListChannelsQuery(\n  $filter: NotificationChannelFilter\n  $limit: Int\n) {\n  adminNotificationChannels(filter: $filter, limit: $limit) {\n    edges {\n      node {\n        id\n        entityId\n        name\n        enabled\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a3894c436b9a548a18ef2bd1d2f5d92d";

export default node;
