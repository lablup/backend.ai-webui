/**
 * @generated SignedSource<<c641d97f465a4052df91621aaa886e1a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly " $fragmentType": "BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment";
};
export type BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key = {
  readonly " $data"?: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    }
  ],
  "type": "KeyPairResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "a9c58cd69e62182cd7a68a75e81c48c7";

export default node;
