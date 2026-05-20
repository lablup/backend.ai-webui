/**
 * @generated SignedSource<<c0cd2f598740cec2d90f4da040cf7100>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactDescriptionsStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactDescriptionsStoriesQuery$data = {
  readonly artifact: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
  } | null | undefined;
};
export type BAIArtifactDescriptionsStoriesQuery = {
  response: BAIArtifactDescriptionsStoriesQuery$data;
  variables: BAIArtifactDescriptionsStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIArtifactDescriptionsStoriesQuery",
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
            "name": "BAIArtifactDescriptionsFragment"
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
    "name": "BAIArtifactDescriptionsStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SourceInfo",
            "kind": "LinkedField",
            "name": "source",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
    "cacheID": "227d7d6583def5b3e67a21e59862ef97",
    "id": null,
    "metadata": {},
    "name": "BAIArtifactDescriptionsStoriesQuery",
    "operationKind": "query",
    "text": "query BAIArtifactDescriptionsStoriesQuery {\n  artifact(id: \"test-id\") {\n    ...BAIArtifactDescriptionsFragment\n    id\n  }\n}\n\nfragment BAIArtifactDescriptionsFragment on Artifact {\n  name\n  description\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n"
  }
};
})();

(node as any).hash = "6b6b5ac1a2c5107d8b308390b2740539";

export default node;
