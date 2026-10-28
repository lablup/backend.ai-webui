/**
 * @generated SignedSource<<235ac74fd8e626cc23f25485136f4853>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManageImageResourceLimitModal_image$data = {
  readonly architecture: string | null | undefined;
  readonly namespace: string | null | undefined;
  readonly registry: string | null | undefined;
  readonly resource_limits: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly max: string | null | undefined;
    readonly min: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly tag: string | null | undefined;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "registry",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "namespace",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "architecture",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "tag",
      "storageKey": null
    }
  ],
  "type": "ImageNode",
  "abstractKey": null
};

(node as any).hash = "7c19e8a276f5c67a5823503248fd911f";

export default node;
