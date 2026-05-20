/**
 * @generated SignedSource<<de9986a1fa36c5aba77302e60f0aeca2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PurgeUsersModalFragment$data = ReadonlyArray<{
  readonly email: string | null | undefined;
  readonly full_name: string | null | undefined;
  readonly id: string;
  readonly username: string | null | undefined;
  readonly " $fragmentType": "PurgeUsersModalFragment";
}>;
export type PurgeUsersModalFragment$key = ReadonlyArray<{
  readonly " $data"?: PurgeUsersModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"PurgeUsersModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "PurgeUsersModalFragment",
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
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "full_name",
      "storageKey": null
    }
  ],
  "type": "UserNode",
  "abstractKey": null
};

(node as any).hash = "2e870bb6b98badf196d37a4402ac903d";

export default node;
