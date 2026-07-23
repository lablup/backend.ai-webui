/**
 * @generated SignedSource<<dda69b5722b3a3a19406ea2dd8a79d14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TensorboardPathModalFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"useBackendAIAppLauncherFragment">;
  readonly " $fragmentType": "TensorboardPathModalFragment";
};
export type TensorboardPathModalFragment$key = {
  readonly " $data"?: TensorboardPathModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TensorboardPathModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TensorboardPathModalFragment",
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
      "name": "row_id",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "useBackendAIAppLauncherFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "7b4ba4104f4d9b2f466e100e830d12e3";

export default node;
