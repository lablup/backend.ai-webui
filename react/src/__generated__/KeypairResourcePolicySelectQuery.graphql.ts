/**
 * @generated SignedSource<<980bfb306071d110bd5eba9fa4ad6b26>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicySelectQuery$variables = Record<PropertyKey, never>;
export type KeypairResourcePolicySelectQuery$data = {
  readonly keypair_resource_policies: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type KeypairResourcePolicySelectQuery = {
  response: KeypairResourcePolicySelectQuery$data;
  variables: KeypairResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "KeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "keypair_resource_policies",
    "plural": true,
    "selections": [
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
    "name": "KeypairResourcePolicySelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "KeypairResourcePolicySelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f1b8b8a22196df6830db5af46e0050cb",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query KeypairResourcePolicySelectQuery {\n  keypair_resource_policies {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "8d526f411223d503c43d6bedff672a64";

export default node;
