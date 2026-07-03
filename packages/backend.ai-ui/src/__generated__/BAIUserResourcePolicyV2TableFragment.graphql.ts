/**
 * @generated SignedSource<<f6aaa185557648583d67828b3b0976f4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIUserResourcePolicyV2TableFragment$data = ReadonlyArray<{
  readonly createdAt: string | null | undefined;
  readonly id: string;
  readonly maxConcurrentLogins: number | null | undefined;
  readonly maxCustomizedImageCount: number;
  readonly maxQuotaScopeSize: {
    readonly value: number;
  };
  readonly maxSessionCountPerModelSession: number;
  readonly maxVfolderCount: number;
  readonly name: string;
  readonly " $fragmentType": "BAIUserResourcePolicyV2TableFragment";
}>;
export type BAIUserResourcePolicyV2TableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIUserResourcePolicyV2TableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIUserResourcePolicyV2TableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIUserResourcePolicyV2TableFragment",
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
      "name": "maxConcurrentLogins",
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

(node as any).hash = "96a28c4f4a3e5c312e5561d50c3bcb73";

export default node;
