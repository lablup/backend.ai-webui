/**
 * @generated SignedSource<<8345b01180f10a9636da976f42bcebe7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePresetPermissionTableFragment$data = {
  readonly id: string;
  readonly scopeType: string;
  readonly " $fragmentType": "RolePresetPermissionTableFragment";
};
export type RolePresetPermissionTableFragment$key = {
  readonly " $data"?: RolePresetPermissionTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePresetPermissionTableFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RolePresetPermissionTableFragment",
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
      "name": "scopeType",
      "storageKey": null
    }
  ],
  "type": "RolePreset",
  "abstractKey": null
};

(node as any).hash = "ac1b7bdf6403fdb62fd47805ee91c1aa";

export default node;
