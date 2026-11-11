/**
 * @generated SignedSource<<7c3f4b99080358d1f8bac3c148321ed7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIHuggingFaceRegistrySettingModalFragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly token: string | null | undefined;
  readonly " $fragmentType": "BAIHuggingFaceRegistrySettingModalFragment";
};
export type BAIHuggingFaceRegistrySettingModalFragment$key = {
  readonly " $data"?: BAIHuggingFaceRegistrySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIHuggingFaceRegistrySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIHuggingFaceRegistrySettingModalFragment",
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
      "name": "token",
      "storageKey": null
    }
  ],
  "type": "HuggingFaceRegistry",
  "abstractKey": null
};

(node as any).hash = "d9f47483bd0c374fa0a6ce0f8684c8fc";

export default node;
