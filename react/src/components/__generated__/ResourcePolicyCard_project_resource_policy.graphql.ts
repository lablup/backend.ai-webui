/**
 * @generated SignedSource<<6abab33e1c0b3540b8034dcd9ad1f6ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePolicyCard_project_resource_policy$data = {
  readonly id: any;
  readonly max_vfolder_size: any | null;
  readonly name: string;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
  readonly " $fragmentType": "ResourcePolicyCard_project_resource_policy";
};
export type ResourcePolicyCard_project_resource_policy$key = {
  readonly " $data"?: ResourcePolicyCard_project_resource_policy$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourcePolicyCard_project_resource_policy">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourcePolicyCard_project_resource_policy",
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
      "name": "ProjectResourcePolicySettingModalFragment"
    }
  ],
  "type": "ProjectResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "fff3d1eace997c19028ac10821a659a8";

export default node;
