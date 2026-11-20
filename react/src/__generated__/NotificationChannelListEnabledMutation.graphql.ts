/**
 * @generated SignedSource<<a6a769fbe66c92bcd97124609c0590da>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
export type NotificationChannelListEnabledMutation$variables = {
  input: UpdateNotificationChannelInput;
};
export type NotificationChannelListEnabledMutation$data = {
  readonly updateNotificationChannel: {
    readonly channel: {
      readonly enabled: boolean;
      readonly id: string;
    };
  } | null | undefined;
};
export type NotificationChannelListEnabledMutation = {
  response: NotificationChannelListEnabledMutation$data;
  variables: NotificationChannelListEnabledMutation$variables;
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
    "name": "NotificationChannelListEnabledMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelListEnabledMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c880d0ae28d7ff5a6baf72e320ae2f44",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelListEnabledMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelListEnabledMutation(\n  $input: UpdateNotificationChannelInput!\n) {\n  updateNotificationChannel(input: $input) {\n    channel {\n      id\n      enabled\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "03bb2f02d503e9d46e549539b3f9110f";

export default node;
