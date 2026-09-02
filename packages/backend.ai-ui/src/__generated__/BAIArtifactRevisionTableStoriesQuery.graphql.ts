/**
 * @generated SignedSource<<95d971bbc1e8e67e6728dc048c7a7347>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionTableStoriesQuery$data = {
  readonly artifact: {
    readonly latestVersion: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableLatestRevisionFragment">;
        };
      }>;
    } | null | undefined;
    readonly revisions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableArtifactRevisionFragment">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type BAIArtifactRevisionTableStoriesQuery = {
  response: BAIArtifactRevisionTableStoriesQuery$data;
  variables: BAIArtifactRevisionTableStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "artifact-1"
  }
],
v1 = [
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
v2 = [
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIArtifactRevisionTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
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
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionTableArtifactRevisionFragment"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:100,offset:0)"
          },
          {
            "alias": "latestVersion",
            "args": (v2/*: any*/),
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
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionTableLatestRevisionFragment"
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
        "storageKey": "artifact(id:\"artifact-1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIArtifactRevisionTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "updatedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:100,offset:0)"
          },
          {
            "alias": "latestVersion",
            "args": (v2/*: any*/),
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
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
          },
          (v3/*: any*/)
        ],
        "storageKey": "artifact(id:\"artifact-1\")"
      }
    ]
  },
  "params": {
    "cacheID": "280a372f093b2e970e9fa51c09e21ed2",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactRevisionTableStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactRevisionTableStoriesQuery {\n  artifact(id: \"artifact-1\") {\n    revisions(limit: 100, offset: 0) {\n      edges {\n        node {\n          ...BAIArtifactRevisionTableArtifactRevisionFragment\n          id\n        }\n      }\n    }\n    latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          ...BAIArtifactRevisionTableLatestRevisionFragment\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactRevisionTableArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n  updatedAt\n  ...BAIArtifactStatusTagFragment\n  ...BAIArtifactRevisionDownloadButtonFragment\n  ...BAIArtifactRevisionDeleteButtonFragment\n}\n\nfragment BAIArtifactRevisionTableLatestRevisionFragment on ArtifactRevision {\n  id\n}\n\nfragment BAIArtifactStatusTagFragment on ArtifactRevision {\n  status\n}\n"
  }
};
})();

(node as any).hash = "c76ddd2bc0d0edc5ec72cca26edf6ad9";

export default node;
