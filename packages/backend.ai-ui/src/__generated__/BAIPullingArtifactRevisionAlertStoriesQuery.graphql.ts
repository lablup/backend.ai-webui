/**
 * @generated SignedSource<<22374723c40e2abdb955d219c9d1ce66>>
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
            "name": "fieldId",
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
    "cacheID": "7ea13ce7a349644de23f406d2cd82136",
    "id": null,
    "metadata": {},
    "name": "BAIPullingArtifactRevisionAlertStoriesQuery",
    "operationKind": "query",
    "text": "query BAIPullingArtifactRevisionAlertStoriesQuery {\n  artifactRevision(id: \"test-id\") {\n    ...BAIPullingArtifactRevisionAlertFragment\n    id\n  }\n}\n\nfragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {\n  id\n  fieldId\n  status\n  version\n}\n"
  }
};
})();

(node as any).hash = "5879107e033d684c4cc44c48f350e669";

export default node;
