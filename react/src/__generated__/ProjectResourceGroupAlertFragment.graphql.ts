/**
 * @generated SignedSource<<5cac4de641eaa134946ab86aa7ea431f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourceGroupAlertFragment$data = {
  readonly domainName: string;
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
      "name": "domainName",
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

(node as any).hash = "ea98aa9dfe400b51a952ca4b7cb7591c";

export default node;
