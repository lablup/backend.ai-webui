/**
 * @generated SignedSource<<b648267855e82819b02f6a602dfe37fd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateUsersModalFragment$data = ReadonlyArray<{
  readonly basicInfo: {
    readonly email: string;
  };
  readonly entityId: string;
  readonly id: string;
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

(node as any).hash = "a16df54c642f5c4ec476e5952876e995";

export default node;
