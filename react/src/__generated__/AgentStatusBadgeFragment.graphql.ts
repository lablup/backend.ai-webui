/**
 * @generated SignedSource<<76ff5419c638e9a556d981093f38a0f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatusBadgeFragment$data = {
  readonly status: string | null | undefined;
  readonly status_changed: string | null | undefined;
  readonly version: string | null | undefined;
  readonly " $fragmentType": "AgentStatusBadgeFragment";
};
export type AgentStatusBadgeFragment$key = {
  readonly " $data"?: AgentStatusBadgeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatusBadgeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentStatusBadgeFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_changed",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "version",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "b54e3b2fc5ebb963991910c26f13f154";

export default node;
