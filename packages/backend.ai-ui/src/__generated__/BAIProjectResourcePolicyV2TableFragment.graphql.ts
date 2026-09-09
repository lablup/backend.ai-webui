/**
 * @generated SignedSource<<f8a051d53c482ea6da0b34043a1b606a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectResourcePolicyV2TableFragment$data = ReadonlyArray<{
  readonly createdAt: string | null | undefined;
  readonly id: string;
  readonly maxNetworkCount: number;
  readonly maxQuotaScopeSize: {
    readonly expr: string;
  };
  readonly maxVfolderCount: number;
  readonly name: string;
  readonly " $fragmentType": "BAIProjectResourcePolicyV2TableFragment";
}>;
export type BAIProjectResourcePolicyV2TableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIProjectResourcePolicyV2TableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIProjectResourcePolicyV2TableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIProjectResourcePolicyV2TableFragment",
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
      "concreteType": "BinarySizeInfo",
      "kind": "LinkedField",
      "name": "maxQuotaScopeSize",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "expr",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxNetworkCount",
      "storageKey": null
    }
  ],
  "type": "ProjectResourcePolicyV2",
  "abstractKey": null
};

(node as any).hash = "991ef65e96e8516fd0f0e2bde5cf3434";

export default node;
