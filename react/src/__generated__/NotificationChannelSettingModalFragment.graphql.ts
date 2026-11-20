/**
 * @generated SignedSource<<51f8ced8c67f2c4fa28c0b6b1f52b721>>
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
    }
  ],
  "type": "NotificationChannel",
  "abstractKey": null
};

(node as any).hash = "0813702652729b451df600851436d44b";

export default node;
