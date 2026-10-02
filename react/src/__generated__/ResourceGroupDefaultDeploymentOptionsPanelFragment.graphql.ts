/**
 * @generated SignedSource<<74051fafd74d28d2d580fa522420895a>>
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

(node as any).hash = "353c1f07b02a083eac89719e42650029";

export default node;
