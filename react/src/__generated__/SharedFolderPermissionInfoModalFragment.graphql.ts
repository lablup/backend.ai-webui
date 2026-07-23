/**
 * @generated SignedSource<<ba2cea0ccd73ee31af98b3c8160cd7e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SharedFolderPermissionInfoModalFragment$data = {
  readonly creator: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly ownership_type: string | null | undefined;
  readonly permission: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly user_email: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionCellFragment">;
  readonly " $fragmentType": "SharedFolderPermissionInfoModalFragment";
};
export type SharedFolderPermissionInfoModalFragment$key = {
  readonly " $data"?: SharedFolderPermissionInfoModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SharedFolderPermissionInfoModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SharedFolderPermissionInfoModalFragment",
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
      "name": "row_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "creator",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ownership_type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderPermissionCellFragment"
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "37ee425057dab91a099b6e6f866e549a";

export default node;
