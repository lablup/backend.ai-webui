/**
 * @generated SignedSource<<2ee7d3c8d2e138a1a65937062bfa6ed1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GeneratedKeypairListModalFragment$data = ReadonlyArray<{
  readonly access_key: string | null | undefined;
  readonly secret_key: string | null | undefined;
  readonly user_info: {
    readonly email: string | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "GeneratedKeypairListModalFragment";
}>;
export type GeneratedKeypairListModalFragment$key = ReadonlyArray<{
  readonly " $data"?: GeneratedKeypairListModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "GeneratedKeypairListModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "access_key",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "secret_key",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserInfo",
      "kind": "LinkedField",
      "name": "user_info",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "KeyPair",
  "abstractKey": null
};

(node as any).hash = "a3a1b6d9c401dfb603fdda3157146445";

export default node;
