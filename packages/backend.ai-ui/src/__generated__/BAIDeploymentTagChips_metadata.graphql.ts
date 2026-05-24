/**
 * @generated SignedSource<<688b13385a6bcd3a2bc215d143c090a3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeploymentTagChips_metadata$data = {
  readonly tags: ReadonlyArray<string>;
  readonly " $fragmentType": "BAIDeploymentTagChips_metadata";
};
export type BAIDeploymentTagChips_metadata$key = {
  readonly " $data"?: BAIDeploymentTagChips_metadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIDeploymentTagChips_metadata",
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

(node as any).hash = "d53bfda1f49643a1eee112b489c2af5e";

export default node;
