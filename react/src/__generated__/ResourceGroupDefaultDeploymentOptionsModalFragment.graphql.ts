/**
 * @generated SignedSource<<c270761436d245fd46642493764f8a2b>>
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

(node as any).hash = "7df32fe0dbdccd8ef60e160481954541";

export default node;
