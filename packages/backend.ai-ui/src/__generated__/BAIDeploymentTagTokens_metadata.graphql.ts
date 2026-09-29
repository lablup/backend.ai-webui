/**
 * @generated SignedSource<<610a437c3931e5e1a0c552665837ee87>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeploymentTagTokens_metadata$data = {
  readonly tags: ReadonlyArray<string>;
  readonly " $fragmentType": "BAIDeploymentTagTokens_metadata";
};
export type BAIDeploymentTagTokens_metadata$key = {
  readonly " $data"?: BAIDeploymentTagTokens_metadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagTokens_metadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIDeploymentTagTokens_metadata",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "tags",
      "storageKey": null
    }
  ],
  "type": "ModelDeploymentMetadata",
  "abstractKey": null
};

(node as any).hash = "b0769ac255daa0b91bfcf58efaf55659";

export default node;
