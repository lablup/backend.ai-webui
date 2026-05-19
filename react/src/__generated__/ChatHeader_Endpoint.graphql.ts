/**
 * @generated SignedSource<<c53946a820e47295c1530ab5d02ed807>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChatHeader_Endpoint$data = {
  readonly endpoint_id: string | null | undefined;
  readonly " $fragmentType": "ChatHeader_Endpoint";
};
export type ChatHeader_Endpoint$key = {
  readonly " $data"?: ChatHeader_Endpoint$data;
  readonly " $fragmentSpreads": FragmentRefs<"ChatHeader_Endpoint">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ChatHeader_Endpoint",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endpoint_id",
      "storageKey": null
    }
  ],
  "type": "Endpoint",
  "abstractKey": null
};

(node as any).hash = "baa41c02cf67330c6bf4313d43280faa";

export default node;
