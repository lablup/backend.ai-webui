/**
 * @generated SignedSource<<9eb009298665af8f2e2aa08ecc5419bb>>
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
  readonly entityId: string;
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
      "kind": "ScalarField",
      "name": "entityId",
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

(node as any).hash = "2341cec2f8284c0614ca1086220f2e35";

export default node;
