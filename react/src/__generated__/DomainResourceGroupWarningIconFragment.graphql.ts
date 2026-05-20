/**
 * @generated SignedSource<<656ce35144aa6fac1a4278affe1a78d6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainResourceGroupWarningIconFragment$data = {
  readonly domainName: string;
  readonly resourceGroupName: string;
  readonly " $fragmentType": "DomainResourceGroupWarningIconFragment";
};
export type DomainResourceGroupWarningIconFragment$key = {
  readonly " $data"?: DomainResourceGroupWarningIconFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainResourceGroupWarningIconFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DomainResourceGroupWarningIconFragment",
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

(node as any).hash = "cb26cbd36b70e2898b48e9637cfe049a";

export default node;
