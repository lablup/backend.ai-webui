/**
 * @generated SignedSource<<5fd6da9d254380c9ef5d429bc9b66a75>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PurgeUsersModalFragment$data = ReadonlyArray<{
  readonly basicInfo: {
    readonly email: string;
  };
  readonly id: string;
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
      "concreteType": "UserV2BasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
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
  "type": "UserV2",
  "abstractKey": null
};

(node as any).hash = "d6402e002c03122082b84f8a319d50c2";

export default node;
