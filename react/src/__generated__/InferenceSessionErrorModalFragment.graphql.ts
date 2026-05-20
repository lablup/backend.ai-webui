/**
 * @generated SignedSource<<e4015810e4423ba99edd19ba13f0a7d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InferenceSessionErrorModalFragment$data = {
  readonly errors: ReadonlyArray<{
    readonly repr: string;
  }>;
  readonly session_id: string | null | undefined;
  readonly " $fragmentType": "InferenceSessionErrorModalFragment";
};
export type InferenceSessionErrorModalFragment$key = {
  readonly " $data"?: InferenceSessionErrorModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InferenceSessionErrorModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InferenceSessionErrorModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "session_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "InferenceSessionErrorInfo",
      "kind": "LinkedField",
      "name": "errors",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "repr",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "InferenceSessionError",
  "abstractKey": null
};

(node as any).hash = "3aff870b3138311d3e5415b7bbb32f53";

export default node;
