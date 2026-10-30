/**
 * @generated SignedSource<<28e26572f478bda95986d9f13420ae37>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIActivateArtifactsModalArtifactsFragment$data = ReadonlyArray<{
  readonly entityId: string;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "BAIActivateArtifactsModalArtifactsFragment";
}>;
export type BAIActivateArtifactsModalArtifactsFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIActivateArtifactsModalArtifactsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIActivateArtifactsModalArtifactsFragment",
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
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};

(node as any).hash = "bf32ede777b45c0c2511693a250a8853";

export default node;
