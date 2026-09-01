/**
 * @generated SignedSource<<10cfe2908f50348978b2836a33276f67>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionAgentIdsStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionAgentIdsStoriesQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionAgentIdsFragment">;
  } | null | undefined;
};
export type BAISessionAgentIdsStoriesQuery = {
  response: BAISessionAgentIdsStoriesQuery$data;
  variables: BAISessionAgentIdsStoriesQuery$variables;
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
    "name": "BAISessionAgentIdsStoriesQuery",
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
            "name": "BAISessionAgentIdsFragment"
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
    "name": "BAISessionAgentIdsStoriesQuery",
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
            "name": "agent_ids",
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
    "cacheID": "6bdbf530e7619125e934b54280a794d2",
    "id": null,
    "metadata": {},
    "name": "BAISessionAgentIdsStoriesQuery",
    "operationKind": "query",
    "text": "query BAISessionAgentIdsStoriesQuery {\n  compute_session_node(id: \"test-id\") {\n    ...BAISessionAgentIdsFragment\n    id\n  }\n}\n\nfragment BAISessionAgentIdsFragment on ComputeSessionNode {\n  agent_ids\n}\n"
  }
};
})();

(node as any).hash = "068be8ce5242b69ece5f2ba69ae4069f";

export default node;
