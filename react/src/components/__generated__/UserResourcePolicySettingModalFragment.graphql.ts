/**
 * @generated SignedSource<<a0948a0f2e44a51e2103e95eae83b900>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicySettingModalFragment$data = {
  readonly created_at: any;
  readonly id: any;
  readonly max_vfolder_size: any | null;
  readonly name: string;
  readonly " $fragmentType": "UserResourcePolicySettingModalFragment";
};
export type UserResourcePolicySettingModalFragment$key = {
  readonly " $data"?: UserResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserResourcePolicySettingModalFragment",
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
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_vfolder_size",
      "storageKey": null
    }
  ],
  "type": "UserResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "00ce66ded6bf021a4faadaa78814ccf4";

export default node;
