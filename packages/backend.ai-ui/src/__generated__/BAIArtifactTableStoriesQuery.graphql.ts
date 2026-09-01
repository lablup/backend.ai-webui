/**
 * @generated SignedSource<<8efa0579d4584a7bbc67e2fdc9deec05>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTableStoriesQuery$data = {
  readonly artifacts: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTableArtifactFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIArtifactTableStoriesQuery = {
  response: BAIArtifactTableStoriesQuery$data;
  variables: BAIArtifactTableStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  (v3/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIArtifactTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                    "name": "BAIArtifactTableArtifactFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "artifacts(limit:100,offset:0)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIArtifactTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SourceInfo",
                    "kind": "LinkedField",
                    "name": "source",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
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
                              (v2/*: any*/),
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
                    "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "artifacts(limit:100,offset:0)"
      }
    ]
  },
  "params": {
    "cacheID": "fabfbfe31bd305871d3d75aaccf17f8e",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactTableStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactTableStoriesQuery {\n  artifacts(limit: 100, offset: 0) {\n    edges {\n      node {\n        ...BAIArtifactTableArtifactFragment\n        id\n      }\n    }\n    count\n  }\n}\n\nfragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactStatusTagFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactTableArtifactFragment on Artifact {\n  id\n  name\n  description\n  updatedAt\n  scannedAt\n  availability\n  registry {\n    name\n    url\n  }\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n  latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n    edges {\n      node {\n        id\n        version\n        size\n        status\n        ...BAIArtifactStatusTagFragment\n        ...BAIArtifactRevisionDownloadButtonFragment\n      }\n    }\n  }\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n"
  }
};
})();

(node as any).hash = "225cd0f6f4c5c53ba620f42b9e8c1442";

export default node;
