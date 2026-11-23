/**
 * @generated SignedSource<<dcb48b0a4dc3f962e52fe3c65cd95ca2>>
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
v3 = {
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
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "spec",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          }
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
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
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
    "cacheID": "ee4d3cb05c9f2fcb301eb9f34f6a886a",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelSettingModalSpecQuery",
    "operationKind": "query",
    "text": "query NotificationChannelSettingModalSpecQuery(\n  $id: ID!\n) {\n  adminNotificationChannel(id: $id) {\n    spec {\n      __typename\n      ... on WebhookSpec {\n        url\n      }\n      ... on EmailSpec {\n        smtp {\n          host\n          port\n          useTls\n          timeout\n        }\n        message {\n          fromEmail\n          toEmails\n          subjectTemplate\n        }\n        auth {\n          username\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d19c1bd10a3fd0c914f9f9082595ef5";

export default node;
