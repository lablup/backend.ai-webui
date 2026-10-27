/**
 * @generated SignedSource<<6f0c0274d5d1a51d5bc4cfda80d497e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIImportArtifactModalArtifactFragment$data = {
  readonly entityId: string;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
      "storageKey": null
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

(node as any).hash = "0acb4346670ccea65e9b31dd5d1dde6b";

export default node;
