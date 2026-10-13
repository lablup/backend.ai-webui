/**
 * @generated SignedSource<<09b67647caf4c946a8023bf0da45634e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AliasedImageTagTokensFragment$data = {
  readonly labels: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly tags: ReadonlyArray<{
    readonly key: string | null | undefined;
    readonly value: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "AliasedImageTagTokensFragment";
};
export type AliasedImageTagTokensFragment$key = {
  readonly " $data"?: AliasedImageTagTokensFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AliasedImageTagTokensFragment">;
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
  "name": "AliasedImageTagTokensFragment",
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

(node as any).hash = "944b22aafddeca28e0228e9b937d392f";

export default node;
