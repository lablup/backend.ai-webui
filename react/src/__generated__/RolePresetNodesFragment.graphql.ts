/**
 * @generated SignedSource<<84f80fa014c7f6b6e4a78a100232ced3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePresetNodesFragment$data = ReadonlyArray<{
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly id: string;
  readonly name: string;
  readonly permissionPresets: {
    readonly count: number;
  } | null | undefined;
  readonly scopeType: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "RolePresetNodesFragment";
}>;
export type RolePresetNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: RolePresetNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePresetNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RolePresetNodesFragment",
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
      "name": "scopeType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "autoAssign",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RolePermissionPresetConnection",
      "kind": "LinkedField",
      "name": "permissionPresets",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "RolePreset",
  "abstractKey": null
};

(node as any).hash = "112c849542b215de923592ce5dcbfd73";

export default node;
