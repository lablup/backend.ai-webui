/**
 * @generated SignedSource<<4d7675da657b4bbd567e5ef269d16d28>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPModelCardListToolsFragment$data = ReadonlyArray<{
  readonly createdAt: string;
  readonly id: string;
  readonly metadata: {
    readonly author: string | null | undefined;
    readonly task: string | null | undefined;
    readonly title: string | null | undefined;
  };
  readonly name: string;
  readonly updatedAt: string | null | undefined;
  readonly " $fragmentType": "WebMCPModelCardListToolsFragment";
}>;
export type WebMCPModelCardListToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPModelCardListToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPModelCardListToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPModelCardListToolsFragment",
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
      "concreteType": "ModelCardV2Metadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "task",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "author",
          "storageKey": null
        }
      ],
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
      "name": "updatedAt",
      "storageKey": null
    }
  ],
  "type": "ModelCardV2",
  "abstractKey": null
};

(node as any).hash = "33d350f9da4eddedc21d8b2371c5d96d";

export default node;
