/**
 * @generated SignedSource<<567bdf5aab657ac6d1fd04f2475be030>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultDeploymentOptionsPanelFragment$data = {
  readonly defaultDeploymentOptions: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsPanel_options">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModalFragment">;
  readonly " $fragmentType": "ResourceGroupDefaultDeploymentOptionsPanelFragment";
};
export type ResourceGroupDefaultDeploymentOptionsPanelFragment$key = {
  readonly " $data"?: ResourceGroupDefaultDeploymentOptionsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsPanelFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultDeploymentOptionsPanelFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "DeploymentOptionsInfo",
      "kind": "LinkedField",
      "name": "defaultDeploymentOptions",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ResourceGroupDefaultDeploymentOptionsPanel_options"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ResourceGroupDefaultDeploymentOptionsModalFragment"
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "038bcf15fc729c0e5f2e3eb8d3180244";

export default node;
