/**
 * @generated SignedSource<<129aeb8ae8ddaa29d60026637ec57a6b>>
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

(node as any).hash = "817c5673fdc8da88c415a057bcff29e5";

export default node;
