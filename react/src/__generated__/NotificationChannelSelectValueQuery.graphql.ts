/**
 * @generated SignedSource<<98f094baf428ce9441841a9278180a96>>
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
export type NotificationChannelSelectValueQuery$variables = {
  filter?: NotificationChannelFilter | null | undefined;
  skip: boolean;
};
export type NotificationChannelSelectValueQuery$data = {
  readonly adminNotificationChannels?: {
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
export type NotificationChannelSelectValueQuery = {
  response: NotificationChannelSelectValueQuery$data;
  variables: NotificationChannelSelectValueQuery$variables;
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
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "filter"
          },
          {
            "kind": "Literal",
            "name": "limit",
            "value": 1
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationChannelSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d86c90227c481a32c895e15da48de258",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSelectValueQuery",
    "operationKind": "query",
    "text": "query NotificationChannelSelectValueQuery(\n  $filter: NotificationChannelFilter\n  $skip: Boolean!\n) {\n  adminNotificationChannels(filter: $filter, limit: 1) @skip(if: $skip) {\n    edges {\n      node {\n        id\n        entityId\n        name\n        channelType\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4584957a2531ae333f79fdfb82987358";

export default node;
