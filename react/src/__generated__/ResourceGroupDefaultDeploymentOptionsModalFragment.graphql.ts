/**
 * @generated SignedSource<<2b5119c08279af57903cdb179009e89f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultDeploymentOptionsModalFragment$data = {
  readonly defaultDeploymentOptions: {
    readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModal_options">;
  };
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "ResourceGroupDefaultDeploymentOptionsModalFragment";
};
export type ResourceGroupDefaultDeploymentOptionsModalFragment$key = {
  readonly " $data"?: ResourceGroupDefaultDeploymentOptionsModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultDeploymentOptionsModalFragment",
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
      "concreteType": "DeploymentOptionsInfo",
      "kind": "LinkedField",
      "name": "defaultDeploymentOptions",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ResourceGroupDefaultDeploymentOptionsModal_options"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "660d6b8d11f13c00071e90280a70fbe8";

export default node;
