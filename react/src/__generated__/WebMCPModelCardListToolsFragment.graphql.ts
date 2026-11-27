/**
 * @generated SignedSource<<ed7ca3abfe9ba113b7ff72d29b753049>>
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
  readonly entityId: string;
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
      "name": "entityId",
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

(node as any).hash = "f16ee85db436a46757a6165e222fffc9";

export default node;
