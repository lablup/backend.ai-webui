/**
 * @generated SignedSource<<4764ebe6a85462defddb12a82889e6de>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserMultiSelectorFragment$data = {
  readonly id: string | null;
  readonly username: string | null;
  readonly " $fragmentType": "UserMultiSelectorFragment";
};
export type UserMultiSelectorFragment$key = {
  readonly " $data"?: UserMultiSelectorFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserMultiSelectorFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserMultiSelectorFragment",
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
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "3b95fda5880600239d6df655ff9d7c82";

export default node;
