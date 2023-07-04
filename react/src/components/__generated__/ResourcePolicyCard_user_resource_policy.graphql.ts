/**
 * @generated SignedSource<<a4f093f133e9ec6249f4da931391b0ae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePolicyCard_user_resource_policy$data = {
  readonly id: any;
  readonly max_vfolder_size: any | null;
  readonly name: string;
  readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
  readonly " $fragmentType": "ResourcePolicyCard_user_resource_policy";
};
export type ResourcePolicyCard_user_resource_policy$key = {
  readonly " $data"?: ResourcePolicyCard_user_resource_policy$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourcePolicyCard_user_resource_policy">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourcePolicyCard_user_resource_policy",
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
      "kind": "ScalarField",
      "name": "max_vfolder_size",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UserResourcePolicySettingModalFragment"
    }
  ],
  "type": "UserResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "449af16bb5d0d4ad3854575394e69e40";

export default node;
