/**
 * @generated SignedSource<<936c76d4f2629dab869423d6bd87492b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAllowedVfolderHostsWithPermissionFromGroupFragment$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly " $fragmentType": "BAIAllowedVfolderHostsWithPermissionFromGroupFragment";
};
export type BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key = {
  readonly " $data"?: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromGroupFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIAllowedVfolderHostsWithPermissionFromGroupFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    }
  ],
  "type": "GroupNode",
  "abstractKey": null
};

(node as any).hash = "27383c90858e3deb78916da7a2df8518";

export default node;
