/**
 * @generated SignedSource<<b6f8860bf0e7d087ca6ad891e0ba0fee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AliasedImageDoubleTagsFragment$data = {
  readonly labels: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly tags: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "AliasedImageDoubleTagsFragment";
};
export type AliasedImageDoubleTagsFragment$key = {
  readonly " $data"?: AliasedImageDoubleTagsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AliasedImageDoubleTagsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AliasedImageDoubleTagsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "KVPair",
      "kind": "LinkedField",
      "name": "labels",
      "plural": true,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "KVPair",
      "kind": "LinkedField",
      "name": "tags",
      "plural": true,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "ImageNode",
  "abstractKey": null
};
})();

(node as any).hash = "b5899ef8dbfcf98e17d8ce576d59525a";

export default node;
