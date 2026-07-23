/**
 * @generated SignedSource<<c71a28026fd4acbed20b7c9da5ed50b8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupSettingModalFragment$data = {
  readonly description: string | null | undefined;
  readonly is_active: boolean | null | undefined;
  readonly is_public: boolean | null | undefined;
  readonly name: string;
  readonly scheduler: string | null | undefined;
  readonly scheduler_opts: string | null | undefined;
  readonly wsproxy_addr: string | null | undefined;
  readonly wsproxy_api_token: string | null | undefined;
  readonly " $fragmentType": "ResourceGroupSettingModalFragment";
} | null | undefined;
export type ResourceGroupSettingModalFragment$key = {
  readonly " $data"?: ResourceGroupSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupSettingModalFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "NONE"
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
      "name": "is_public",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "wsproxy_addr",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "wsproxy_api_token",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scheduler",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scheduler_opts",
      "storageKey": null
    }
  ],
  "type": "ScalingGroup",
  "abstractKey": null
};

(node as any).hash = "0ab802477d12e3999d4ed89849da6631";

export default node;
