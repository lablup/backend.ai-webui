/**
 * @generated SignedSource<<76a0a2726c7468b03e1c81f785039e73>>
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
      readonly spec: {
        readonly auth?: {
          readonly username: string | null | undefined;
        } | null | undefined;
        readonly message?: {
          readonly fromEmail: string;
          readonly subjectTemplate: string | null | undefined;
          readonly toEmails: ReadonlyArray<string>;
        };
        readonly smtp?: {
          readonly host: string;
          readonly port: number;
          readonly timeout: number;
          readonly useTls: boolean;
        };
        readonly url?: string;
      };
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
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "channelType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
},
v7 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "WebhookSpec",
  "abstractKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SMTPConnection",
      "kind": "LinkedField",
      "name": "smtp",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "host",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "port",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "useTls",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "timeout",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EmailMessage",
      "kind": "LinkedField",
      "name": "message",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fromEmail",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "toEmails",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "subjectTemplate",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SMTPAuth",
      "kind": "LinkedField",
      "name": "auth",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "EmailSpec",
  "abstractKey": null
};
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "spec",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "spec",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  (v7/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "1fec74f2f596adb7ada6932b8bc4ef20",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelSettingModalUpdateMutation(\n  $input: UpdateNotificationChannelInput!\n) {\n  updateNotificationChannel(input: $input) {\n    channel {\n      id\n      name\n      description\n      channelType\n      enabled\n      spec {\n        __typename\n        ... on WebhookSpec {\n          url\n        }\n        ... on EmailSpec {\n          smtp {\n            host\n            port\n            useTls\n            timeout\n          }\n          message {\n            fromEmail\n            toEmails\n            subjectTemplate\n          }\n          auth {\n            username\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "260508dba19516aa89e6298a94265fa8";

export default node;
