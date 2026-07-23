/**
 * @generated SignedSource<<6b7e5c1c4a5dd685250a95f886557a13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIImportArtifactModalArtifactFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
  readonly " $fragmentType": "BAIImportArtifactModalArtifactFragment";
};
export type BAIImportArtifactModalArtifactFragment$key = {
  readonly " $data"?: BAIImportArtifactModalArtifactFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIImportArtifactModalArtifactFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "THROW"
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactDescriptionsFragment"
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};

(node as any).hash = "20983eccde7bea0a9ca172aa30beca15";

export default node;
