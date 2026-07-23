/**
 * @generated SignedSource<<ccf7d89769b1c2d1dc10071236464d92>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactStatusTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactStatusTagStoriesQuery$data = {
  readonly artifactRevision: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusTagFragment">;
  } | null | undefined;
};
export type BAIArtifactStatusTagStoriesQuery = {
  response: BAIArtifactStatusTagStoriesQuery$data;
  variables: BAIArtifactStatusTagStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIArtifactStatusTagStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ArtifactRevision",
        "kind": "LinkedField",
        "name": "artifactRevision",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIArtifactStatusTagFragment"
          }
        ],
        "storageKey": "artifactRevision(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIArtifactStatusTagStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ArtifactRevision",
        "kind": "LinkedField",
        "name": "artifactRevision",
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
        "storageKey": "artifactRevision(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "a64b2336055fc725402cb523db9ea84a",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactStatusTagStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactStatusTagStoriesQuery {\n  artifactRevision(id: \"test-id\") {\n    ...BAIArtifactStatusTagFragment\n    id\n  }\n}\n\nfragment BAIArtifactStatusTagFragment on ArtifactRevision {\n  status\n}\n"
  }
};
})();

(node as any).hash = "91f823f4c03690521c3660a34caa442b";

export default node;
