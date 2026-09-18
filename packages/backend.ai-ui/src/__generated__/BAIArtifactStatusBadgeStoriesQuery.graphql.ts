/**
 * @generated SignedSource<<dc5f51ac728520213e4e680be2783b1b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactStatusBadgeStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactStatusBadgeStoriesQuery$data = {
  readonly artifactRevision: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusBadgeFragment">;
  } | null | undefined;
};
export type BAIArtifactStatusBadgeStoriesQuery = {
  response: BAIArtifactStatusBadgeStoriesQuery$data;
  variables: BAIArtifactStatusBadgeStoriesQuery$variables;
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
    "name": "BAIArtifactStatusBadgeStoriesQuery",
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
            "name": "BAIArtifactStatusBadgeFragment"
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
    "name": "BAIArtifactStatusBadgeStoriesQuery",
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
    "cacheID": "a4f1d2b684ddc6be1d5616d50d8506e1",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactStatusBadgeStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactStatusBadgeStoriesQuery {\n  artifactRevision(id: \"test-id\") {\n    ...BAIArtifactStatusBadgeFragment\n    id\n  }\n}\n\nfragment BAIArtifactStatusBadgeFragment on ArtifactRevision {\n  status\n}\n"
  }
};
})();

(node as any).hash = "d7b63c13ed92e6096642716d77225775";

export default node;
