/**
 * @generated SignedSource<<80d742b72485720e39ffc1b9b7015ca2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupInfoModalFragment$data = {
  readonly description: string | null | undefined;
  readonly driver: string | null | undefined;
  readonly driver_opts: string | null | undefined;
  readonly is_active: boolean | null | undefined;
  readonly is_public: boolean | null | undefined;
  readonly name: string;
  readonly scheduler: string | null | undefined;
  readonly scheduler_opts: string | null | undefined;
  readonly wsproxy_addr: string | null | undefined;
  readonly " $fragmentType": "ResourceGroupInfoModalFragment";
} | null | undefined;
export type ResourceGroupInfoModalFragment$key = {
  readonly " $data"?: ResourceGroupInfoModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupInfoModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupInfoModalFragment",
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
      "name": "driver",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "driver_opts",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "wsproxy_addr",
      "storageKey": null
    }
  ],
  "type": "ScalingGroup",
  "abstractKey": null
};

(node as any).hash = "32b9c1a86a13b37cf5abb7e88f1cd969";

export default node;
