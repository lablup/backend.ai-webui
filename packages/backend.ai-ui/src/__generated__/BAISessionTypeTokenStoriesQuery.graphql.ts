/**
 * @generated SignedSource<<725c86c7598dc6222916074bcb1db4e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTokenStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionTypeTokenStoriesQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTokenFragment">;
  } | null | undefined;
};
export type BAISessionTypeTokenStoriesQuery = {
  response: BAISessionTypeTokenStoriesQuery$data;
  variables: BAISessionTypeTokenStoriesQuery$variables;
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
    "name": "BAISessionTypeTokenStoriesQuery",
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
            "name": "BAISessionTypeTokenFragment"
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
    "name": "BAISessionTypeTokenStoriesQuery",
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
    "cacheID": "544efa84db4da8c4fc7b1f8ca5ac0492",
    "id": null,
    "metadata": {},
    "name": "BAISessionTypeTokenStoriesQuery",
    "operationKind": "query",
    "text": "query BAISessionTypeTokenStoriesQuery {\n  compute_session_node(id: \"test-id\") {\n    ...BAISessionTypeTokenFragment\n    id\n  }\n}\n\nfragment BAISessionTypeTokenFragment on ComputeSessionNode {\n  type\n}\n"
  }
};
})();

(node as any).hash = "52f3cae3481fbfb07ce4ad64aaafce18";

export default node;
