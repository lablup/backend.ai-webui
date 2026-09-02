/**
 * @generated SignedSource<<bbb4679044e9b1c2bd908f5c04dcf101>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourceGroupWarningIconFragment$data = {
  readonly domainName: string;
  readonly projectId: string;
  readonly resourceGroupName: string;
  readonly " $fragmentType": "ProjectResourceGroupWarningIconFragment";
};
export type ProjectResourceGroupWarningIconFragment$key = {
  readonly " $data"?: ProjectResourceGroupWarningIconFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourceGroupWarningIconFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectResourceGroupWarningIconFragment",
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

(node as any).hash = "1439ed47cfe440f97352d1780af96d65";

export default node;
