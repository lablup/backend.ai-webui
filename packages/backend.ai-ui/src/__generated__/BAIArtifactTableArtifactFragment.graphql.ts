/**
 * @generated SignedSource<<51756aae9a8802d86f348ae39b184142>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTableArtifactFragment$data = ReadonlyArray<{
  readonly availability: ArtifactAvailability;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly latestVersion: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly size: any | null | undefined;
        readonly status: ArtifactStatus;
        readonly version: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment" | "BAIArtifactStatusTagFragment">;
      };
    }>;
  } | null | undefined;
  readonly name: string;
  readonly registry: {
    readonly name: string | null | undefined;
    readonly url: string | null | undefined;
  };
  readonly scannedAt: string;
  readonly source: {
    readonly name: string | null | undefined;
    readonly url: string | null | undefined;
  };
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
  readonly " $fragmentType": "BAIArtifactTableArtifactFragment";
}>;
export type BAIArtifactTableArtifactFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIArtifactTableArtifactFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTableArtifactFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIArtifactTableArtifactFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scannedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "availability",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SourceInfo",
      "kind": "LinkedField",
      "name": "registry",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SourceInfo",
      "kind": "LinkedField",
      "name": "source",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactTypeTagFragment"
    },
    {
      "alias": "latestVersion",
      "args": [
        {
          "kind": "Literal",
          "name": "limit",
          "value": 1
        },
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": [
            {
              "direction": "DESC",
              "field": "VERSION"
            },
            {
              "direction": "DESC",
              "field": "UPDATED_AT"
            }
          ]
        }
      ],
      "concreteType": "ArtifactRevisionConnection",
      "kind": "LinkedField",
      "name": "revisions",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ArtifactRevisionEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ArtifactRevision",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "version",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "size",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "status",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "BAIArtifactStatusTagFragment"
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "BAIArtifactRevisionDownloadButtonFragment"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};
})();

(node as any).hash = "db5f2e64d1a54eb2ff5aeeb289f39e34";

export default node;
