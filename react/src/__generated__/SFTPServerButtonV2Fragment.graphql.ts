/**
 * @generated SignedSource<<2aa0d450b0a8a53405558be7ff8f4627>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SFTPServerButtonV2Fragment$data = {
  readonly host: string;
  readonly id: string;
  readonly " $fragmentType": "SFTPServerButtonV2Fragment";
};
export type SFTPServerButtonV2Fragment$key = {
  readonly " $data"?: SFTPServerButtonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SFTPServerButtonV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SFTPServerButtonV2Fragment",
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
      "name": "host",
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "2f5e3fcd4a3628503f3a7834810de34b";

export default node;
