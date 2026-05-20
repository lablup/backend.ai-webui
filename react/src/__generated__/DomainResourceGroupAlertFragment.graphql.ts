/**
 * @generated SignedSource<<fe5ee9cdf6d10481ebd340a2fff2daff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainResourceGroupAlertFragment$data = {
  readonly domainName: string;
  readonly resourceGroupName: string;
  readonly " $fragmentType": "DomainResourceGroupAlertFragment";
};
export type DomainResourceGroupAlertFragment$key = {
  readonly " $data"?: DomainResourceGroupAlertFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainResourceGroupAlertFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DomainResourceGroupAlertFragment",
  "selections": [
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
  "type": "DomainFairShare",
  "abstractKey": null
};

(node as any).hash = "5438a38ef5c6aa2af381abd2d07a2d5c";

export default node;
