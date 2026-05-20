/**
 * @generated SignedSource<<4837a722a58b7a0e4acb050e329067ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionDetailDrawerFragment$data = {
  readonly id: string;
  readonly project_id: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionDetailContentFragment">;
  readonly " $fragmentType": "SessionDetailDrawerFragment";
};
export type SessionDetailDrawerFragment$key = {
  readonly " $data"?: SessionDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionDetailDrawerFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionDetailDrawerFragment",
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
      "name": "project_id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionDetailContentFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "eb57207016a6a8cf6abbf348456840de";

export default node;
