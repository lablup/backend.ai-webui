/**
 * @generated SignedSource<<d5725a4bcbe85fadbe8fcf4ba31c2642>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelSettingModalSpecQuery$variables = {
  id: string;
};
export type NotificationChannelSettingModalSpecQuery$data = {
  readonly adminNotificationChannel: {
    readonly spec: {
      readonly email: {
        readonly auth: {
          readonly username: string | null | undefined;
        } | null | undefined;
        readonly message: {
          readonly fromEmail: string;
          readonly subjectTemplate: string | null | undefined;
          readonly toEmails: ReadonlyArray<string>;
        };
        readonly smtp: {
          readonly host: string;
          readonly port: number;
          readonly timeout: number;
          readonly useTls: boolean;
        };
      } | null | undefined;
      readonly webhook: {
        readonly url: string;
      } | null | undefined;
    };
  } | null | undefined;
};
export type NotificationChannelSettingModalSpecQuery = {
  response: NotificationChannelSettingModalSpecQuery$data;
  variables: NotificationChannelSettingModalSpecQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "NotificationChannelSpec",
  "kind": "LinkedField",
  "name": "spec",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "WebhookSpec",
      "kind": "LinkedField",
      "name": "webhook",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EmailSpec",
      "kind": "LinkedField",
      "name": "email",
      "plural": false,
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
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationChannelSettingModalSpecQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NotificationChannel",
        "kind": "LinkedField",
        "name": "adminNotificationChannel",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelSettingModalSpecQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NotificationChannel",
        "kind": "LinkedField",
        "name": "adminNotificationChannel",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c4dccb6f3fd71e42af42a96be8d1f689",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalSpecQuery",
    "operationKind": "query",
    "text": "query NotificationChannelSettingModalSpecQuery(\n  $id: ID!\n) {\n  adminNotificationChannel(id: $id) {\n    spec {\n      webhook {\n        url\n      }\n      email {\n        smtp {\n          host\n          port\n          useTls\n          timeout\n        }\n        message {\n          fromEmail\n          toEmails\n          subjectTemplate\n        }\n        auth {\n          username\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e99e01a766ee06c36e7093e89de04891";

export default node;
