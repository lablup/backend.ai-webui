/**
 * @generated SignedSource<<b0c7bb4f09fcb3b8d432ed343eb80273>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultSessionOptionsModalFragment$data = {
  readonly defaultSessionOptions: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsModal_options">;
  };
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "ResourceGroupDefaultSessionOptionsModalFragment";
};
export type ResourceGroupDefaultSessionOptionsModalFragment$key = {
  readonly " $data"?: ResourceGroupDefaultSessionOptionsModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultSessionOptionsModalFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "DefaultSessionOptionsInfo",
      "kind": "LinkedField",
      "name": "defaultSessionOptions",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ResourceGroupDefaultSessionOptionsModal_options"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "ac6e268cc547784832b2e6448fa49473";

export default node;
