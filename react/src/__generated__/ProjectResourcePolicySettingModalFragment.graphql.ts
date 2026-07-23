/**
 * @generated SignedSource<<eaf1fd7bc1d92c56bc2d65772dfe7a31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourcePolicySettingModalFragment$data = {
  readonly created_at: string;
  readonly id: string;
  readonly max_network_count: number | null | undefined;
  readonly max_quota_scope_size: any | null | undefined;
  readonly max_vfolder_count: number | null | undefined;
  readonly name: string;
  readonly " $fragmentType": "ProjectResourcePolicySettingModalFragment";
};
export type ProjectResourcePolicySettingModalFragment$key = {
  readonly " $data"?: ProjectResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectResourcePolicySettingModalFragment",
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
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_vfolder_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_quota_scope_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_network_count",
      "storageKey": null
    }
  ],
  "type": "ProjectResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "949f6a93198024700bf15197f3b613f0";

export default node;
