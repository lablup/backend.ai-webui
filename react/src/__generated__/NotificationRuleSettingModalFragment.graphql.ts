/**
 * @generated SignedSource<<fb5ea5bfb092bacdb6606fc6d87e16cc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type NotificationRuleSettingModalFragment$data = {
  readonly channelId: string;
  readonly description: string | null | undefined;
  readonly enabled: boolean;
  readonly entityId: string;
  readonly id: string;
  readonly messageTemplate: string;
  readonly name: string;
  readonly ruleType: NotificationRuleType;
  readonly " $fragmentType": "NotificationRuleSettingModalFragment";
};
export type NotificationRuleSettingModalFragment$key = {
  readonly " $data"?: NotificationRuleSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"NotificationRuleSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NotificationRuleSettingModalFragment",
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
      "name": "ruleType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "channelId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "messageTemplate",
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
  "type": "NotificationRule",
  "abstractKey": null
};

(node as any).hash = "6ba497022f0a722e690a6000f1ffe9f2";

export default node;
