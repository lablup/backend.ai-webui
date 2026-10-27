/**
 * @generated SignedSource<<ec4f494b0ac65a873d0af62e8198faeb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type NotificationsPanelQuery$variables = Record<PropertyKey, never>;
export type NotificationsPanelQuery$data = {
  readonly channels: {
    readonly count: number;
  } | null | undefined;
  readonly enabledChannels: {
    readonly count: number;
  } | null | undefined;
  readonly enabledRules: {
    readonly count: number;
  } | null | undefined;
  readonly rules: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly channel: {
          readonly name: string;
        };
        readonly enabled: boolean;
        readonly id: string;
        readonly name: string;
        readonly ruleType: NotificationRuleType;
      };
    }>;
  } | null | undefined;
};
export type NotificationsPanelQuery = {
  response: NotificationsPanelQuery$data;
  variables: NotificationsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v1 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "enabled": true
    }
  },
  (v0/*: any*/)
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
],
v4 = {
  "alias": "enabledRules",
  "args": (v1/*: any*/),
  "concreteType": "NotificationRuleConnection",
  "kind": "LinkedField",
  "name": "adminNotificationRules",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "adminNotificationRules(filter:{\"enabled\":true},limit:1)"
},
v5 = {
  "alias": "channels",
  "args": [
    (v0/*: any*/)
  ],
  "concreteType": "NotificationChannelConnection",
  "kind": "LinkedField",
  "name": "adminNotificationChannels",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "adminNotificationChannels(limit:1)"
},
v6 = {
  "alias": "enabledChannels",
  "args": (v1/*: any*/),
  "concreteType": "NotificationChannelConnection",
  "kind": "LinkedField",
  "name": "adminNotificationChannels",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "adminNotificationChannels(filter:{\"enabled\":true},limit:1)"
},
v7 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 20
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ruleType",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationsPanelQuery",
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "alias": "rules",
        "args": (v7/*: any*/),
        "concreteType": "NotificationRuleConnection",
        "kind": "LinkedField",
        "name": "adminNotificationRules",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationRule",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NotificationChannel",
                    "kind": "LinkedField",
                    "name": "channel",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/)
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
        "storageKey": "adminNotificationRules(limit:20,orderBy:[{\"direction\":\"ASC\",\"field\":\"NAME\"}])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NotificationsPanelQuery",
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "alias": "rules",
        "args": (v7/*: any*/),
        "concreteType": "NotificationRuleConnection",
        "kind": "LinkedField",
        "name": "adminNotificationRules",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationRule",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NotificationChannel",
                    "kind": "LinkedField",
                    "name": "channel",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/),
                      (v8/*: any*/)
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
        "storageKey": "adminNotificationRules(limit:20,orderBy:[{\"direction\":\"ASC\",\"field\":\"NAME\"}])"
      }
    ]
  },
  "params": {
    "cacheID": "4e1e2949aa60ac4c594ea505e1af7efa",
    "id": null,
    "metadata": {},
    "name": "NotificationsPanelQuery",
    "operationKind": "query",
    "text": "query NotificationsPanelQuery {\n  enabledRules: adminNotificationRules(filter: {enabled: true}, limit: 1) {\n    count\n  }\n  channels: adminNotificationChannels(limit: 1) {\n    count\n  }\n  enabledChannels: adminNotificationChannels(filter: {enabled: true}, limit: 1) {\n    count\n  }\n  rules: adminNotificationRules(orderBy: [{field: NAME, direction: ASC}], limit: 20) {\n    count\n    edges {\n      node {\n        id\n        name\n        ruleType\n        enabled\n        channel {\n          name\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "65d39f0ed6a834d9461bf1791f4e5867";

export default node;
