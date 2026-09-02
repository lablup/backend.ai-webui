/**
 * @generated SignedSource<<840c7624709333fe2300314787705e76>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIPullingArtifactRevisionAlertStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIPullingArtifactRevisionAlertStoriesQuery$data = {
  readonly artifactRevision: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIPullingArtifactRevisionAlertFragment">;
  } | null | undefined;
};
export type BAIPullingArtifactRevisionAlertStoriesQuery = {
  response: BAIPullingArtifactRevisionAlertStoriesQuery$data;
  variables: BAIPullingArtifactRevisionAlertStoriesQuery$variables;
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
    "name": "BAIPullingArtifactRevisionAlertStoriesQuery",
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
            "name": "BAIPullingArtifactRevisionAlertFragment"
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
    "name": "BAIPullingArtifactRevisionAlertStoriesQuery",
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
            "name": "id",
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
            "name": "version",
            "storageKey": null
          }
        ],
        "storageKey": "artifactRevision(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "48eef0100b716d30964bc30242bb953a",
    "id": null,
    "metadata": {},
    "name": "BAIPullingArtifactRevisionAlertStoriesQuery",
    "operationKind": "query",
    "text": "query BAIPullingArtifactRevisionAlertStoriesQuery {\n  artifactRevision(id: \"test-id\") {\n    ...BAIPullingArtifactRevisionAlertFragment\n    id\n  }\n}\n\nfragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {\n  id\n  status\n  version\n}\n"
  }
};
})();

(node as any).hash = "5879107e033d684c4cc44c48f350e669";

export default node;
