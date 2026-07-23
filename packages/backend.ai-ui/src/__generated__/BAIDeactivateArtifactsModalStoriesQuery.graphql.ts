/**
 * @generated SignedSource<<13f922896cf1f7b4f185461fccedd593>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeactivateArtifactsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIDeactivateArtifactsModalStoriesQuery$data = {
  readonly artifacts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeactivateArtifactsModalArtifactsFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIDeactivateArtifactsModalStoriesQuery = {
  response: BAIDeactivateArtifactsModalStoriesQuery$data;
  variables: BAIDeactivateArtifactsModalStoriesQuery$variables;
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
    "name": "BAIDeactivateArtifactsModalStoriesQuery",
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
                    "name": "BAIDeactivateArtifactsModalArtifactsFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "artifacts(first:10,offset:0)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIDeactivateArtifactsModalStoriesQuery",
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
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "artifacts(first:10,offset:0)"
      }
    ]
  },
  "params": {
    "cacheID": "18e18a043c534bc5e25da6405e7b1af9",
    "id": null,
    "metadata": {},
    "name": "BAIDeactivateArtifactsModalStoriesQuery",
    "operationKind": "query",
    "text": "query BAIDeactivateArtifactsModalStoriesQuery {\n  artifacts(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIDeactivateArtifactsModalArtifactsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIDeactivateArtifactsModalArtifactsFragment on Artifact {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "62755d4a528917eb88590facd80b7764";

export default node;
