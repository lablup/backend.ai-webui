/**
 * @generated SignedSource<<f81eb59b25058fb495453584555808e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePresetPermissionTableFragment$data = {
  readonly entityId: string;
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
      "name": "entityId",
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

(node as any).hash = "a82e9bf4afd828668ca7f90f9e2daf54";

export default node;
