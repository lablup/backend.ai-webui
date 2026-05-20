/**
 * @generated SignedSource<<a01e2f2ba8f33fa2f4c71cd5ef01ce88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateUsersModalFragment$data = ReadonlyArray<{
  readonly email: string | null | undefined;
  readonly full_name: string | null | undefined;
  readonly id: string;
  readonly username: string | null | undefined;
  readonly " $fragmentType": "UpdateUsersModalFragment";
}>;
export type UpdateUsersModalFragment$key = ReadonlyArray<{
  readonly " $data"?: UpdateUsersModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UpdateUsersModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UpdateUsersModalFragment",
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

(node as any).hash = "38f8b5d5f53c9a1edaad681cf1d0c8c9";

export default node;
