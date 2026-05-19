/**
 * @generated SignedSource<<8f03232c778a5cd7a7628fe74171607c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = Record<PropertyKey, never>;
export type BAIProjectResourcePolicySelectQuery$data = {
  readonly project_resource_policies: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  } | null | undefined> | null | undefined;
};
export type BAIProjectResourcePolicySelectQuery = {
  response: BAIProjectResourcePolicySelectQuery$data;
  variables: BAIProjectResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "project_resource_policies",
    "plural": true,
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
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIProjectResourcePolicySelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "39cc27464533ff3c069e6a09e9c9f6d7",
    "id": null,
    "metadata": {},
    "name": "BAIProjectResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query BAIProjectResourcePolicySelectQuery {\n  project_resource_policies {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "14c444e2cf01f37216116304c1d4efa1";

export default node;
