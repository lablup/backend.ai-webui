/**
 * @generated SignedSource<<7c217021eacb1aa06f12d8cc39ba9de9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIImageNodeSimpleTagV2Fragment$data = {
  readonly identity: {
    readonly architecture: string;
    readonly canonicalName: string;
    readonly namespace: string;
  };
  readonly metadata: {
    readonly labels: ReadonlyArray<{
      readonly key: string;
      readonly value: string;
    }>;
    readonly tags: ReadonlyArray<{
      readonly key: string;
      readonly value: string;
    }>;
  };
  readonly " $fragmentType": "BAIImageNodeSimpleTagV2Fragment";
};
export type BAIImageNodeSimpleTagV2Fragment$key = {
  readonly " $data"?: BAIImageNodeSimpleTagV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIImageNodeSimpleTagV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ImageV2IdentityInfo",
      "kind": "LinkedField",
      "name": "identity",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "canonicalName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "namespace",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "architecture",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ImageV2MetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ImageV2TagEntry",
          "kind": "LinkedField",
          "name": "tags",
          "plural": true,
          "selections": (v0/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ImageV2LabelEntry",
          "kind": "LinkedField",
          "name": "labels",
          "plural": true,
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ImageV2",
  "abstractKey": null
};
})();

(node as any).hash = "56f20360b700b9a175cc1583a5f1d5d8";

export default node;
