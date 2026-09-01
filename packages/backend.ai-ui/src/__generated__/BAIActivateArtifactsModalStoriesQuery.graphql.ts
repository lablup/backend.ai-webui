/**
 * @generated SignedSource<<b06f44232ddc1d13de004f21791e15b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIActivateArtifactsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIActivateArtifactsModalStoriesQuery$data = {
  readonly artifacts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIActivateArtifactsModalStoriesQuery = {
  response: BAIActivateArtifactsModalStoriesQuery$data;
  variables: BAIActivateArtifactsModalStoriesQuery$variables;
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
    "name": "BAIActivateArtifactsModalStoriesQuery",
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
                    "name": "BAIActivateArtifactsModalArtifactsFragment"
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
    "name": "BAIActivateArtifactsModalStoriesQuery",
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
    "cacheID": "6a579b9f3efbffeff3ed78d38d8fd4c5",
    "id": null,
    "metadata": {},
    "name": "BAIActivateArtifactsModalStoriesQuery",
    "operationKind": "query",
    "text": "query BAIActivateArtifactsModalStoriesQuery {\n  artifacts(offset: 0, first: 10) {\n    edges {\n      node {\n        ...BAIActivateArtifactsModalArtifactsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIActivateArtifactsModalArtifactsFragment on Artifact {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "c04be905fb0e56da729ca2f2c35c6bed";

export default node;
