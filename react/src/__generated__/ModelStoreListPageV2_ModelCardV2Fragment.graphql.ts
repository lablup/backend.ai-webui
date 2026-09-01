/**
 * @generated SignedSource<<6c2b9e243b00294d6fa43a1d348839cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelStoreListPageV2_ModelCardV2Fragment$data = {
  readonly availablePresets: {
    readonly count: number;
  } | null | undefined;
  readonly createdAt: string;
  readonly metadata: {
    readonly author: string | null | undefined;
    readonly task: string | null | undefined;
    readonly title: string | null | undefined;
  };
  readonly name: string;
  readonly updatedAt: string | null | undefined;
  readonly " $fragmentType": "ModelStoreListPageV2_ModelCardV2Fragment";
};
export type ModelStoreListPageV2_ModelCardV2Fragment$key = {
  readonly " $data"?: ModelStoreListPageV2_ModelCardV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModelStoreListPageV2_ModelCardV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModelStoreListPageV2_ModelCardV2Fragment",
  "selections": [
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
      "name": "updatedAt",
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
      "args": [
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": [
            {
              "direction": "ASC",
              "field": "RANK"
            }
          ]
        }
      ],
      "concreteType": "DeploymentRevisionPresetConnection",
      "kind": "LinkedField",
      "name": "availablePresets",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        }
      ],
      "storageKey": "availablePresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
    }
  ],
  "type": "ModelCardV2",
  "abstractKey": null
};

(node as any).hash = "f08cd180c0472627ef0ab92757975604";

export default node;
