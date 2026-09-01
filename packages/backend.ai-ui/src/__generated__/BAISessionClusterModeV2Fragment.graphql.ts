/**
 * @generated SignedSource<<9715c40b082f23fab2c837a68198c5cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISessionClusterModeV2Fragment$data = {
  readonly clusterMode: ClusterMode;
  readonly clusterSize: number;
  readonly " $fragmentType": "BAISessionClusterModeV2Fragment";
};
export type BAISessionClusterModeV2Fragment$key = {
  readonly " $data"?: BAISessionClusterModeV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionClusterModeV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clusterMode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clusterSize",
      "storageKey": null
    }
  ],
  "type": "SessionV2MetadataInfo",
  "abstractKey": null
};

(node as any).hash = "2b8a355b669f0c9c9b84fcbebcc6b331";

export default node;
