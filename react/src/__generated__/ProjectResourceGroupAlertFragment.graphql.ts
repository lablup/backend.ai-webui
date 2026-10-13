/**
 * @generated SignedSource<<6b87daee6afecf1104eb63344ab36ef1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourceGroupAlertFragment$data = {
  readonly projectId: string;
  readonly resourceGroupName: string;
  readonly " $fragmentType": "ProjectResourceGroupAlertFragment";
};
export type ProjectResourceGroupAlertFragment$key = {
  readonly " $data"?: ProjectResourceGroupAlertFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourceGroupAlertFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectResourceGroupAlertFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "projectId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resourceGroupName",
      "storageKey": null
    }
  ],
  "type": "ProjectFairShare",
  "abstractKey": null
};

(node as any).hash = "79159388c8e077e93cccaad99beac10f";

export default node;
