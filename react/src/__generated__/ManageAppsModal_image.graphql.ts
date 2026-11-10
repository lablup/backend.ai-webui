/**
 * @generated SignedSource<<2eee50cb3c4f2ac61017fd4d1eb2eeaf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManageAppsModal_image$data = {
  readonly labels: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "ManageAppsModal_image";
};
export type ManageAppsModal_image$key = {
  readonly " $data"?: ManageAppsModal_image$data;
  readonly " $fragmentSpreads": FragmentRefs<"ManageAppsModal_image">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ManageAppsModal_image",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "KVPair",
      "kind": "LinkedField",
      "name": "labels",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "key",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "value",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ImageNode",
  "abstractKey": null
};

(node as any).hash = "fec1ae759ec0b780ff6905784330a09a";

export default node;
