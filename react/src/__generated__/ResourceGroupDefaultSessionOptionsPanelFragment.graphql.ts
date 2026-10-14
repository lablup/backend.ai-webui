/**
 * @generated SignedSource<<86b5f5ad847efeaee59ad6a3bcbb542e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultSessionOptionsPanelFragment$data = {
  readonly defaultSessionOptions: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsPanel_options">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsModalFragment">;
  readonly " $fragmentType": "ResourceGroupDefaultSessionOptionsPanelFragment";
};
export type ResourceGroupDefaultSessionOptionsPanelFragment$key = {
  readonly " $data"?: ResourceGroupDefaultSessionOptionsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsPanelFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultSessionOptionsPanelFragment",
  "selections": [
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
          "name": "ResourceGroupDefaultSessionOptionsPanel_options"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ResourceGroupDefaultSessionOptionsModalFragment"
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "a39484c5b2f5d3a8e60bce6999064cae";

export default node;
