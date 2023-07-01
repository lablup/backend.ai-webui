/**
 * @generated SignedSource<<7ee3849db1e701d63ac5f808e819d5ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourcePolicySettingModalFragment$data = {
  readonly created_at: any;
  readonly id: any;
  readonly max_vfolder_size: any | null;
  readonly name: string;
  readonly " $fragmentType": "ProjectResourcePolicySettingModalFragment";
};
export type ProjectResourcePolicySettingModalFragment$key = {
  readonly " $data"?: ProjectResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectResourcePolicySettingModalFragment",
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
  "type": "ProjectResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "a11454523af2ce0351cf9b2bfe041744";

export default node;
