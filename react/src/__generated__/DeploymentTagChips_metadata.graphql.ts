/**
 * @generated SignedSource<<396a7f8bacd9cb53bdc1f75860d7b096>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentTagChips_metadata$data = {
  readonly tags: ReadonlyArray<string>;
  readonly " $fragmentType": "DeploymentTagChips_metadata";
};
export type DeploymentTagChips_metadata$key = {
  readonly " $data"?: DeploymentTagChips_metadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentTagChips_metadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentTagChips_metadata",
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

(node as any).hash = "09c80fd04129c0ba6b62f536a8cbd531";

export default node;
