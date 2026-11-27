/**
 * @generated SignedSource<<85c89403226595615f1aa0b664d5ac2a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
export type UpdateNotificationChannelInput = {
  description?: string | null | undefined;
  enabled?: boolean | null | undefined;
  id: string;
  name?: string | null | undefined;
  spec?: NotificationChannelSpecInput | null | undefined;
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
export type NotificationChannelSettingModalUpdateMutation$variables = {
  input: UpdateNotificationChannelInput;
};
export type NotificationChannelSettingModalUpdateMutation$data = {
  readonly updateNotificationChannel: {
    readonly channel: {
      readonly channelType: NotificationChannelType;
      readonly description: string | null | undefined;
      readonly enabled: boolean;
      readonly id: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type NotificationChannelSettingModalUpdateMutation = {
  response: NotificationChannelSettingModalUpdateMutation$data;
  variables: NotificationChannelSettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateNotificationChannelPayload",
    "kind": "LinkedField",
    "name": "updateNotificationChannel",
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
            "name": "name",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationChannelSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "57c761c8a3d2a0d82745f648221f1bce",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelSettingModalUpdateMutation(\n  $input: UpdateNotificationChannelInput!\n) {\n  updateNotificationChannel(input: $input) {\n    channel {\n      id\n      name\n      description\n      channelType\n      enabled\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c22849d4fde42211590c8987c288ea8";

export default node;
