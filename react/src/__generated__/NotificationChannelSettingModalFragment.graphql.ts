/**
 * @generated SignedSource<<f655165c2d33a22619a0fcdcaab0bc17>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type NotificationChannelType = "EMAIL" | "WEBHOOK" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type NotificationChannelSettingModalFragment$data = {
  readonly channelType: NotificationChannelType;
  readonly description: string | null | undefined;
  readonly enabled: boolean;
  readonly entityId: string;
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
  readonly " $fragmentType": "NotificationChannelSettingModalFragment";
};
export type NotificationChannelSettingModalFragment$key = {
  readonly " $data"?: NotificationChannelSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"NotificationChannelSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NotificationChannelSettingModalFragment",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "spec",
      "plural": false,
      "selections": [
        {
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
        {
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationChannel",
  "abstractKey": null
};

(node as any).hash = "4d606480e216eee704206541581b0230";

export default node;
