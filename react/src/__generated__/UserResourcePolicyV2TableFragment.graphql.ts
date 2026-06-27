/**
 * @generated SignedSource<<f61004757973c5a35381c1cdf1e6c122>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicyV2TableFragment$data = ReadonlyArray<{
  readonly createdAt: string | null | undefined;
  readonly id: string;
  readonly maxCustomizedImageCount: number;
  readonly maxQuotaScopeSize: {
    readonly value: number;
  };
  readonly maxSessionCountPerModelSession: number;
  readonly maxVfolderCount: number;
  readonly name: string;
  readonly " $fragmentType": "UserResourcePolicyV2TableFragment";
}>;
export type UserResourcePolicyV2TableFragment$key = ReadonlyArray<{
  readonly " $data"?: UserResourcePolicyV2TableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicyV2TableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UserResourcePolicyV2TableFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxVfolderCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxSessionCountPerModelSession",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "BinarySizeInfo",
      "kind": "LinkedField",
      "name": "maxQuotaScopeSize",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "value",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxCustomizedImageCount",
      "storageKey": null
    }
  ],
  "type": "UserResourcePolicyV2",
  "abstractKey": null
};

(node as any).hash = "6600200193848f9f14f67503c70675ca";

export default node;
