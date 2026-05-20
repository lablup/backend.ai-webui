/**
 * @generated SignedSource<<7f7d049f1ced6ce4960fe28e36b9ab33>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionDeleteButtonStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionDeleteButtonStoriesQuery$data = {
  readonly artifactRevisions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIArtifactRevisionDeleteButtonStoriesQuery = {
  response: BAIArtifactRevisionDeleteButtonStoriesQuery$data;
  variables: BAIArtifactRevisionDeleteButtonStoriesQuery$variables;
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
    "name": "BAIArtifactRevisionDeleteButtonStoriesQuery",
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
                    "name": "BAIArtifactRevisionDeleteButtonFragment"
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
    "name": "BAIArtifactRevisionDeleteButtonStoriesQuery",
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
    "cacheID": "f9256d5d3a660072ce8d48a252703e6f",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactRevisionDeleteButtonStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactRevisionDeleteButtonStoriesQuery {\n  artifactRevisions(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIArtifactRevisionDeleteButtonFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {\n  status\n}\n"
  }
};
})();

(node as any).hash = "9ca7f892cff7056588b89ee6cae001e2";

export default node;
