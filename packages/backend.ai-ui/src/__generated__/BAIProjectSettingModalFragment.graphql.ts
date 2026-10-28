/**
 * @generated SignedSource<<f7db515766540257204490cadc16c755>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectSettingModalFragment$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly container_registry: string | null | undefined;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly integration_id: string | null | undefined;
  readonly is_active: boolean | null | undefined;
  readonly name: string | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly total_resource_slots: string | null | undefined;
  readonly type: string | null | undefined;
  readonly " $fragmentType": "BAIProjectSettingModalFragment";
};
export type BAIProjectSettingModalFragment$key = {
  readonly " $data"?: BAIProjectSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIProjectSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIProjectSettingModalFragment",
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
      "name": "row_id",
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
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_active",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "total_resource_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "integration_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_registry",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scaling_groups",
      "storageKey": null
    }
  ],
  "type": "GroupNode",
  "abstractKey": null
};

(node as any).hash = "ea7429ecb2f341f517a3d89df897629b";

export default node;
