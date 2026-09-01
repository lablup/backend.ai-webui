/**
 * @generated SignedSource<<29634ae30b5642bbe761f4dc5a6a6ff6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIImportArtifactModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIImportArtifactModalStoriesQuery$data = {
  readonly artifactRevisions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactRevisionFragment">;
      };
    }>;
  } | null | undefined;
  readonly artifacts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIImportArtifactModalStoriesQuery = {
  response: BAIImportArtifactModalStoriesQuery$data;
  variables: BAIImportArtifactModalStoriesQuery$variables;
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
    "name": "BAIImportArtifactModalStoriesQuery",
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
                    "name": "BAIImportArtifactModalArtifactFragment"
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
                    "name": "BAIImportArtifactModalArtifactRevisionFragment"
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
    "name": "BAIImportArtifactModalStoriesQuery",
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
    "cacheID": "8770594107fabf03fdec1a71bd39f28e",
    "id": null,
    "metadata": {},
    "name": "BAIImportArtifactModalStoriesQuery",
    "operationKind": "query",
    "text": "query BAIImportArtifactModalStoriesQuery {\n  artifacts(offset: 0, first: 1) {\n    edges {\n      node {\n        ...BAIImportArtifactModalArtifactFragment\n        id\n      }\n    }\n  }\n  artifactRevisions(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIImportArtifactModalArtifactRevisionFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIArtifactDescriptionsFragment on Artifact {\n  name\n  description\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n\nfragment BAIImportArtifactModalArtifactFragment on Artifact {\n  id\n  name\n  ...BAIArtifactDescriptionsFragment\n}\n\nfragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n}\n"
  }
};
})();

(node as any).hash = "394fcfbbf5961a2e6360c1529efe1be7";

export default node;
