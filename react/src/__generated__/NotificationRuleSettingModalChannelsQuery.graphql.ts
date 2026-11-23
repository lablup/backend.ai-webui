/**
 * @generated SignedSource<<4ab319fa0710f6d1d905a36532b39b4e>>
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
    "cacheID": "1d6ddf3a6294f797bacccaa097ef956e",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalChannelsQuery",
    "operationKind": "query",
    "text": "query NotificationRuleSettingModalChannelsQuery {\n  adminNotificationChannels(orderBy: [{field: NAME, direction: ASC}], limit: 100) {\n    edges {\n      node {\n        id\n        entityId\n        name\n        channelType\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b9c816e634870e52079ba6e2cf7ca22a";

export default node;
