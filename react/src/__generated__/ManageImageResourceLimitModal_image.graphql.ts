/**
 * @generated SignedSource<<d8400afa57fbc94026aa9fa713a29ed3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManageImageResourceLimitModal_image$data = {
  readonly resource_limits: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly max: string | null | undefined;
    readonly min: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "ManageImageResourceLimitModal_image";
};
export type ManageImageResourceLimitModal_image$key = {
  readonly " $data"?: ManageImageResourceLimitModal_image$data;
  readonly " $fragmentSpreads": FragmentRefs<"ManageImageResourceLimitModal_image">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ManageImageResourceLimitModal_image",
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
      "concreteType": "ResourceLimit",
      "kind": "LinkedField",
      "name": "resource_limits",
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
          "name": "min",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "max",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ImageNode",
  "abstractKey": null
};

(node as any).hash = "464ad0741296cef1b31411a172ecf9a0";

export default node;
