/**
 * @generated SignedSource<<b817448f4c0af5cdfb9b2e127ab7f429>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactDescriptionsFragment$data = {
  readonly description: string | null | undefined;
  readonly name: string;
  readonly source: {
    readonly name: string | null | undefined;
    readonly url: string | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTokenFragment">;
  readonly " $fragmentType": "BAIArtifactDescriptionsFragment";
};
export type BAIArtifactDescriptionsFragment$key = {
  readonly " $data"?: BAIArtifactDescriptionsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactDescriptionsFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SourceInfo",
      "kind": "LinkedField",
      "name": "source",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactTypeTokenFragment"
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};
})();

(node as any).hash = "6b8b05b1999cb37d1990e80a12ae600a";

export default node;
