/**
 * @generated SignedSource<<98ff77f6cf5b96545dfb6e1654bf96e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
      readonly " $fragmentSpreads": FragmentRefs<"NotificationChannelSettingModalFragment">;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationChannelSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "NotificationChannelSettingModalFragment"
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
    "name": "NotificationChannelSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "91f2c9ffd225877a0fa77d93d92d6c1c",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelSettingModalUpdateMutation(\n  $input: UpdateNotificationChannelInput!\n) {\n  updateNotificationChannel(input: $input) {\n    channel {\n      ...NotificationChannelSettingModalFragment\n      id\n    }\n  }\n}\n\nfragment NotificationChannelSettingModalFragment on NotificationChannel {\n  id\n  entityId\n  name\n  description\n  channelType\n  enabled\n}\n"
  }
};
})();

(node as any).hash = "89caa5aab7f14f2bfb6454ea6f16b572";

export default node;
