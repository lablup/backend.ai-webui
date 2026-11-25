/**
 * @generated SignedSource<<1f10f7a0d46ff42e015d95860f4e6b0a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type CreateNotificationRuleInput = {
  channelId: string;
  description?: string | null | undefined;
  enabled?: boolean;
  messageTemplate: string;
  name: string;
  ruleType: NotificationRuleType;
};
export type NotificationRuleSettingModalCreateMutation$variables = {
  input: CreateNotificationRuleInput;
};
export type NotificationRuleSettingModalCreateMutation$data = {
  readonly adminCreateNotificationRule: {
    readonly rule: {
      readonly channel: {
        readonly name: string;
      };
      readonly entityId: string;
      readonly id: string;
    };
  } | null | undefined;
};
export type NotificationRuleSettingModalCreateMutation = {
  response: NotificationRuleSettingModalCreateMutation$data;
  variables: NotificationRuleSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationRuleSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateNotificationRulePayload",
        "kind": "LinkedField",
        "name": "adminCreateNotificationRule",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRule",
            "kind": "LinkedField",
            "name": "rule",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationChannel",
                "kind": "LinkedField",
                "name": "channel",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateNotificationRulePayload",
        "kind": "LinkedField",
        "name": "adminCreateNotificationRule",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NotificationRule",
            "kind": "LinkedField",
            "name": "rule",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationChannel",
                "kind": "LinkedField",
                "name": "channel",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/)
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
    "cacheID": "c9cf15e39596d35f0b83a5ae6ab7497b",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleSettingModalCreateMutation(\n  $input: CreateNotificationRuleInput!\n) {\n  adminCreateNotificationRule(input: $input) {\n    rule {\n      id\n      entityId\n      channel {\n        name\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "49c6cd1a063d2583dba55f4e4f5df393";

export default node;
