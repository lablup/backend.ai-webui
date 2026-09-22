/**
 * @generated SignedSource<<00f8a962dc10906a3fb0bfedb2326cfa>>
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

(node as any).hash = "40575d04a8aad160c8b8385cc80c7fab";

export default node;
