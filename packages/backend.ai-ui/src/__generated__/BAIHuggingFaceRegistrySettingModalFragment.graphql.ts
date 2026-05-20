/**
 * @generated SignedSource<<d2e8dd9fab08e8f3a59b0bf659688d83>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIHuggingFaceRegistrySettingModalFragment$data = {
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
      "name": "token",
      "storageKey": null
    }
  ],
  "type": "HuggingFaceRegistry",
  "abstractKey": null
};

(node as any).hash = "b3f51484ba434fc50f57f259dd61546e";

export default node;
