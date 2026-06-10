/**
 * @generated SignedSource<<07d3a321c54efbdbdd07d48f9d713e55>>
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
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    }
  ],
  "type": "Domain",
  "abstractKey": null
};

(node as any).hash = "e50bd79276075388e1d7fa37245a993e";

export default node;
