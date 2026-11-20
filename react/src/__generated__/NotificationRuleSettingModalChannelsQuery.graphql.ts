/**
 * @generated SignedSource<<d330c624bd311c25fcd8e90f8e1e716e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
export type NotificationRuleSettingModalChannelsQuery$variables = Record<PropertyKey, never>;
export type NotificationRuleSettingModalChannelsQuery$data = {
  readonly adminNotificationChannels: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly channelType: NotificationChannelType;
        readonly enabled: boolean;
        readonly entityId: string;
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type NotificationRuleSettingModalChannelsQuery = {
  response: NotificationRuleSettingModalChannelsQuery$data;
  variables: NotificationRuleSettingModalChannelsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
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
    "storageKey": "adminNotificationChannels(limit:100,orderBy:[{\"direction\":\"ASC\",\"field\":\"NAME\"}])"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationRuleSettingModalChannelsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NotificationRuleSettingModalChannelsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "6483fa2c6ab9ba69daf4b23a52a0fdc5",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalChannelsQuery",
    "operationKind": "query",
    "text": "query NotificationRuleSettingModalChannelsQuery {\n  adminNotificationChannels(orderBy: [{field: NAME, direction: ASC}], limit: 100) {\n    edges {\n      node {\n        id\n        entityId\n        name\n        channelType\n        enabled\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "03392868a3c9dd9e0c12002a446ee836";

export default node;
