/**
 * @generated SignedSource<<ed6832af9d5e3095b20a5bd5f6095975>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePresetSettingModalFragment$data = {
  readonly id: string | null | undefined;
  readonly name: string | null | undefined;
  readonly resource_slots: string | null | undefined;
  readonly scaling_group_name: string | null | undefined;
  readonly shared_memory: any | null | undefined;
  readonly " $fragmentType": "ResourcePresetSettingModalFragment";
};
export type ResourcePresetSettingModalFragment$key = {
  readonly " $data"?: ResourcePresetSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourcePresetSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourcePresetSettingModalFragment",
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
      "name": "resource_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "shared_memory",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scaling_group_name",
      "storageKey": null
    }
  ],
  "type": "ResourcePreset",
  "abstractKey": null
};

(node as any).hash = "3ad7baa8a7ac667b320fb07683811506";

export default node;
