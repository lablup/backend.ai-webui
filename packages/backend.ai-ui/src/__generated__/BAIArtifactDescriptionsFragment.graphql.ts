/**
 * @generated SignedSource<<acb019ce986fafbfa7f6c6b75936a471>>
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
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
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
      "name": "BAIArtifactTypeTagFragment"
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};
})();

(node as any).hash = "72f809fc549edf3101d3994ddc540f18";

export default node;
