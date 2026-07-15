/**
 * @generated SignedSource<<d48d8864638a4fe0880c9cf09337fdc2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ScopedRolePermissionCardFragment$data = {
  readonly id: string;
  readonly " $fragmentType": "ScopedRolePermissionCardFragment";
};
export type ScopedRolePermissionCardFragment$key = {
  readonly " $data"?: ScopedRolePermissionCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCardFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ScopedRolePermissionCardFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "06e3de04e26adf1318279e300ad69f66";

export default node;
