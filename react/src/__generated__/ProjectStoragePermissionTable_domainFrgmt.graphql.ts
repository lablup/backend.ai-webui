/**
 * @generated SignedSource<<b20994f670127cc8bad994ed44ee794c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectStoragePermissionTable_domainFrgmt$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ProjectStoragePermissionTable_domainFrgmt";
};
export type ProjectStoragePermissionTable_domainFrgmt$key = {
  readonly " $data"?: ProjectStoragePermissionTable_domainFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectStoragePermissionTable_domainFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectStoragePermissionTable_domainFrgmt",
  "selections": [
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
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    }
  ],
  "type": "Domain",
  "abstractKey": null
};

(node as any).hash = "1673f3173292dd216a80e445fe2eafbf";

export default node;
