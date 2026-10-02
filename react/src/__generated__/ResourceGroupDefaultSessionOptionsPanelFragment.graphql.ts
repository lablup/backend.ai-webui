/**
 * @generated SignedSource<<62feadfb2b56d5d50dd6d8f203731908>>
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

(node as any).hash = "2b0dfbeb80252394cc830a766838e050";

export default node;
