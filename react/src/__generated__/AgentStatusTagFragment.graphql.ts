/**
 * @generated SignedSource<<c7db4c7236d179f5ede6c53c014f5012>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatusTagFragment$data = {
  readonly status: string | null | undefined;
  readonly status_changed: string | null | undefined;
  readonly version: string | null | undefined;
  readonly " $fragmentType": "AgentStatusTagFragment";
};
export type AgentStatusTagFragment$key = {
  readonly " $data"?: AgentStatusTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatusTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentStatusTagFragment",
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

(node as any).hash = "60d06f04af063d56f0756d9d6541a5b6";

export default node;
