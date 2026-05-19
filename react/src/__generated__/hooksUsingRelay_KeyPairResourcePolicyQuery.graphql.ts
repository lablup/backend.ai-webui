/**
 * @generated SignedSource<<faefe22560757fbb38c82f728808ef43>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type hooksUsingRelay_KeyPairResourcePolicyQuery$variables = {
  name: string;
};
export type hooksUsingRelay_KeyPairResourcePolicyQuery$data = {
  readonly keypair_resource_policy: {
    readonly max_concurrent_sessions: number | null | undefined;
    readonly max_containers_per_session: number | null | undefined;
  } | null | undefined;
};
export type hooksUsingRelay_KeyPairResourcePolicyQuery = {
  response: hooksUsingRelay_KeyPairResourcePolicyQuery$data;
  variables: hooksUsingRelay_KeyPairResourcePolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "KeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "keypair_resource_policy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_containers_per_session",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_concurrent_sessions",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ad7039c1935637fe3f3841f0ea8bf347",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_KeyPairResourcePolicyQuery(\n  $name: String!\n) {\n  keypair_resource_policy(name: $name) {\n    max_containers_per_session\n    max_concurrent_sessions\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3f7364c63aefe9b03111b584c48c103";

export default node;
