/**
 * @generated SignedSource<<23252b52fcd76ea55a3dc390eaa4ee51>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManageAppsModal_image$data = {
  readonly architecture: string | null | undefined;
  readonly labels: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly namespace: string | null | undefined;
  readonly registry: string | null | undefined;
  readonly tag: string | null | undefined;
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

(node as any).hash = "6eb4eed02e97c3b3290ac08758d6c251";

export default node;
