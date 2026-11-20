/**
 * @generated SignedSource<<3542723a207976c18d1f20214740add1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
export type CreateNotificationChannelInput = {
  channelType: NotificationChannelType;
  description?: string | null | undefined;
  enabled?: boolean;
  name: string;
  spec: NotificationChannelSpecInput;
};
export type NotificationChannelSpecInput = {
  email?: EmailSpecInput | null | undefined;
  webhook?: WebhookSpecInput | null | undefined;
};
export type WebhookSpecInput = {
  url: string;
};
export type EmailSpecInput = {
  auth?: SMTPAuthInput | null | undefined;
  message: EmailMessageInput;
  smtp: SMTPConnectionInput;
};
export type SMTPConnectionInput = {
  host: string;
  port: number;
  timeout?: number;
  useTls?: boolean;
};
export type EmailMessageInput = {
  fromEmail: string;
  subjectTemplate?: string | null | undefined;
  toEmails: ReadonlyArray<string>;
};
export type SMTPAuthInput = {
  password?: string | null | undefined;
  username?: string | null | undefined;
};
export type NotificationChannelSettingModalCreateMutation$variables = {
  input: CreateNotificationChannelInput;
};
export type NotificationChannelSettingModalCreateMutation$data = {
  readonly adminCreateNotificationChannel: {
    readonly channel: {
      readonly entityId: string;
      readonly id: string;
    };
  } | null | undefined;
};
export type NotificationChannelSettingModalCreateMutation = {
  response: NotificationChannelSettingModalCreateMutation$data;
  variables: NotificationChannelSettingModalCreateMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateNotificationChannelPayload",
    "kind": "LinkedField",
    "name": "adminCreateNotificationChannel",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationChannel",
        "kind": "LinkedField",
        "name": "channel",
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
    "name": "NotificationChannelSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "50f2d36085ceff0cd73bf5555b40ae89",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelSettingModalCreateMutation(\n  $input: CreateNotificationChannelInput!\n) {\n  adminCreateNotificationChannel(input: $input) {\n    channel {\n      id\n      entityId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "083e7c8bc3a32422c014743fb48c327d";

export default node;
