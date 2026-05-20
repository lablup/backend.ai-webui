/**
 * @generated SignedSource<<92800fdf4b9050de8b6c9ac2c653d388>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTypeTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTypeTagStoriesQuery$data = {
  readonly artifact: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
  } | null | undefined;
};
export type BAIArtifactTypeTagStoriesQuery = {
  response: BAIArtifactTypeTagStoriesQuery$data;
  variables: BAIArtifactTypeTagStoriesQuery$variables;
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
    "name": "BAIArtifactTypeTagStoriesQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIArtifactTypeTagFragment"
          }
        ],
        "storageKey": "artifact(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIArtifactTypeTagStoriesQuery",
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
            "args": null,
            "kind": "ScalarField",
            "name": "type",
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
        "storageKey": "artifact(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "6ad342e243a6da352e54cbfa2c093d30",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactTypeTagStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactTypeTagStoriesQuery {\n  artifact(id: \"test-id\") {\n    ...BAIArtifactTypeTagFragment\n    id\n  }\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n"
  }
};
})();

(node as any).hash = "597813df486cc4451f0de81ef66a98d8";

export default node;
