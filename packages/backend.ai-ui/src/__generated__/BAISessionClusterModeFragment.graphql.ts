/**
 * @generated SignedSource<<7dc52b965ca94814e5e330743681faa5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionClusterModeFragment$data = {
  readonly cluster_mode: string | null | undefined;
  readonly cluster_size: number | null | undefined;
  readonly " $fragmentType": "BAISessionClusterModeFragment";
};
export type BAISessionClusterModeFragment$key = {
  readonly " $data"?: BAISessionClusterModeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionClusterModeFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_size",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "90b43e862e9e63218f96dbf3067af0ff";

export default node;
