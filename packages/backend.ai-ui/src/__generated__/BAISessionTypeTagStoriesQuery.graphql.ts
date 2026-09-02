/**
 * @generated SignedSource<<b837bb90e9f9ceffc2edb987fef3e0d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionTypeTagStoriesQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTagFragment">;
  } | null | undefined;
};
export type BAISessionTypeTagStoriesQuery = {
  response: BAISessionTypeTagStoriesQuery$data;
  variables: BAISessionTypeTagStoriesQuery$variables;
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
    "name": "BAISessionTypeTagStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAISessionTypeTagFragment"
          }
        ],
        "storageKey": "compute_session_node(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAISessionTypeTagStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
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
        "storageKey": "compute_session_node(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "fdc449b1bc1e5052271a94f3d1d6f731",
    "id": null,
    "metadata": {},
    "name": "BAISessionTypeTagStoriesQuery",
    "operationKind": "query",
    "text": "query BAISessionTypeTagStoriesQuery {\n  compute_session_node(id: \"test-id\") {\n    ...BAISessionTypeTagFragment\n    id\n  }\n}\n\nfragment BAISessionTypeTagFragment on ComputeSessionNode {\n  type\n}\n"
  }
};
})();

(node as any).hash = "04a515b49499e71f2318e6d8c052c8bd";

export default node;
