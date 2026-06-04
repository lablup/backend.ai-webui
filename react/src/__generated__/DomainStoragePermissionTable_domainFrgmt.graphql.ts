/**
 * @generated SignedSource<<68c54e67344d7b5bde796e1f68b40057>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainStoragePermissionTable_domainFrgmt$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "DomainStoragePermissionTable_domainFrgmt";
};
export type DomainStoragePermissionTable_domainFrgmt$key = {
  readonly " $data"?: DomainStoragePermissionTable_domainFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_domainFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DomainStoragePermissionTable_domainFrgmt",
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

(node as any).hash = "753cd6cd976e96f53122b07ae5aeedea";

export default node;
