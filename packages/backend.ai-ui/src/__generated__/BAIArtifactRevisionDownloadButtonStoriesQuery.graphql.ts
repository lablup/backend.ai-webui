/**
 * @generated SignedSource<<873a34efc59087502ac9273900b97e6a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionDownloadButtonStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionDownloadButtonStoriesQuery$data = {
  readonly artifactRevisions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIArtifactRevisionDownloadButtonStoriesQuery = {
  response: BAIArtifactRevisionDownloadButtonStoriesQuery$data;
  variables: BAIArtifactRevisionDownloadButtonStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIArtifactRevisionDownloadButtonStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ArtifactRevisionConnection",
        "kind": "LinkedField",
        "name": "artifactRevisions",
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
        "storageKey": "artifactRevisions(first:10,offset:0)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIArtifactRevisionDownloadButtonStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ArtifactRevisionConnection",
        "kind": "LinkedField",
        "name": "artifactRevisions",
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "artifactRevisions(first:10,offset:0)"
      }
    ]
  },
  "params": {
    "cacheID": "77a4d987273a48514738c15aca128a7e",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactRevisionDownloadButtonStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactRevisionDownloadButtonStoriesQuery {\n  artifactRevisions(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIArtifactRevisionDownloadButtonFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {\n  status\n}\n"
  }
};
})();

(node as any).hash = "110e07e8baadc5bd84cb7bb1803ec55c";

export default node;
