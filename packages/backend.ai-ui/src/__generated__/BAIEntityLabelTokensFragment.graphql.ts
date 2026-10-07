/**
 * @generated SignedSource<<dccb1dbb0cc7dca655114dc561077d7d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIEntityLabelTokensFragment$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly key: string;
      readonly value: string;
    };
  }>;
  readonly " $fragmentType": "BAIEntityLabelTokensFragment";
};
export type BAIEntityLabelTokensFragment$key = {
  readonly " $data"?: BAIEntityLabelTokensFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelTokensFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIEntityLabelTokensFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "EntityLabelEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "EntityLabel",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "key",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "value",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "EntityLabelConnection",
  "abstractKey": null
};

(node as any).hash = "d7fadc96e6716a1ebee3337b05aa02a3";

export default node;
