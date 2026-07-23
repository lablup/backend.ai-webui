/**
 * @generated SignedSource<<6fa1a866e3ddef8f2742f8e8757cfa63>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionClusterModeStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionClusterModeStoriesQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeFragment">;
  } | null | undefined;
};
export type BAISessionClusterModeStoriesQuery = {
  response: BAISessionClusterModeStoriesQuery$data;
  variables: BAISessionClusterModeStoriesQuery$variables;
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
    "name": "BAISessionClusterModeStoriesQuery",
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
            "name": "BAISessionClusterModeFragment"
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
    "name": "BAISessionClusterModeStoriesQuery",
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
            "name": "cluster_mode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cluster_size",
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
    "cacheID": "683c58f5cc7d486c656a52c4682ec43e",
    "id": null,
    "metadata": {},
    "name": "BAISessionClusterModeStoriesQuery",
    "operationKind": "query",
    "text": "query BAISessionClusterModeStoriesQuery {\n  compute_session_node(id: \"test-id\") {\n    ...BAISessionClusterModeFragment\n    id\n  }\n}\n\nfragment BAISessionClusterModeFragment on ComputeSessionNode {\n  cluster_mode\n  cluster_size\n}\n"
  }
};
})();

(node as any).hash = "cf1726a4d435182cb2fd3e04c772fb8c";

export default node;
