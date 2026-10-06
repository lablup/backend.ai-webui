/**
 * @generated SignedSource<<7dc2df8fd73d591f7e335ccd5b71da13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIEntityLabelSettingModalFragment$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly fieldId: string;
      readonly key: string;
      readonly value: string;
    };
  }>;
  readonly " $fragmentType": "BAIEntityLabelSettingModalFragment";
};
export type BAIEntityLabelSettingModalFragment$key = {
  readonly " $data"?: BAIEntityLabelSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIEntityLabelSettingModalFragment",
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
              "name": "fieldId",
              "storageKey": null
            },
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

(node as any).hash = "9e2ae7207d9a14ccdd2d463995385985";

export default node;
