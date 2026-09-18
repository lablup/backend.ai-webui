/**
 * @generated SignedSource<<3d974cd4fb9c0fd141e6479e1de25e66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTypeTokenStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTypeTokenStoriesQuery$data = {
  readonly artifact: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTokenFragment">;
  } | null | undefined;
};
export type BAIArtifactTypeTokenStoriesQuery = {
  response: BAIArtifactTypeTokenStoriesQuery$data;
  variables: BAIArtifactTypeTokenStoriesQuery$variables;
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
    "name": "BAIArtifactTypeTokenStoriesQuery",
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
            "name": "BAIArtifactTypeTokenFragment"
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
    "name": "BAIArtifactTypeTokenStoriesQuery",
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
    "cacheID": "cd3962224f3d57d1be6fbf4b9554b456",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactTypeTokenStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactTypeTokenStoriesQuery {\n  artifact(id: \"test-id\") {\n    ...BAIArtifactTypeTokenFragment\n    id\n  }\n}\n\nfragment BAIArtifactTypeTokenFragment on Artifact {\n  type\n}\n"
  }
};
})();

(node as any).hash = "2af805b826ef9c70e09b815fac9f22ba";

export default node;
