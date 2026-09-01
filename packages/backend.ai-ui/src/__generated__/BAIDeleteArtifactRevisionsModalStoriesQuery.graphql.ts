/**
 * @generated SignedSource<<89eb78960574c3bde8afc0c46b1f29bd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeleteArtifactRevisionsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIDeleteArtifactRevisionsModalStoriesQuery$data = {
  readonly artifactRevisions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment">;
      };
    }>;
  } | null | undefined;
  readonly artifacts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIDeleteArtifactRevisionsModalStoriesQuery = {
  response: BAIDeleteArtifactRevisionsModalStoriesQuery$data;
  variables: BAIDeleteArtifactRevisionsModalStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  },
  (v0/*: any*/)
],
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  },
  (v0/*: any*/)
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDeleteArtifactRevisionsModalStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ArtifactConnection",
        "kind": "LinkedField",
        "name": "artifacts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIDeleteArtifactRevisionsModalArtifactFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "artifacts(first:1,offset:0)"
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                    "name": "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment"
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
    "name": "BAIDeleteArtifactRevisionsModalStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ArtifactConnection",
        "kind": "LinkedField",
        "name": "artifacts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
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
                      (v4/*: any*/),
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
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "artifacts(first:1,offset:0)"
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
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
    "cacheID": "2e0bb30a6e454cb5bf2ce24191a441ef",
    "id": null,
    "metadata": {},
    "name": "BAIDeleteArtifactRevisionsModalStoriesQuery",
    "operationKind": "query",
    "text": "query BAIDeleteArtifactRevisionsModalStoriesQuery {\n  artifacts(offset: 0, first: 1) {\n    edges {\n      node {\n        ...BAIDeleteArtifactRevisionsModalArtifactFragment\n        id\n      }\n    }\n  }\n  artifactRevisions(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIArtifactDescriptionsFragment on Artifact {\n  name\n  description\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n\nfragment BAIDeleteArtifactRevisionsModalArtifactFragment on Artifact {\n  id\n  ...BAIArtifactDescriptionsFragment\n}\n\nfragment BAIDeleteArtifactRevisionsModalArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n}\n"
  }
};
})();

(node as any).hash = "219164404d6fd8910ca00a4e7fff6816";

export default node;
