/**
 * @generated SignedSource<<6ea2a00115a832aea4b2885a9fb3afb7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type hooksUsingRelay_KeyPairQuery$variables = {
  accessKey: string;
};
export type hooksUsingRelay_KeyPairQuery$data = {
  readonly keypair: {
    readonly concurrency_used: number | null | undefined;
    readonly id: string | null | undefined;
    readonly resource_policy: string | null | undefined;
  } | null | undefined;
};
export type hooksUsingRelay_KeyPairQuery = {
  response: hooksUsingRelay_KeyPairQuery$data;
  variables: hooksUsingRelay_KeyPairQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "accessKey"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "access_key",
        "variableName": "accessKey"
      }
    ],
    "concreteType": "KeyPair",
    "kind": "LinkedField",
    "name": "keypair",
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
        "name": "resource_policy",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "concurrency_used",
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
    "name": "hooksUsingRelay_KeyPairQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksUsingRelay_KeyPairQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1f8fc324e9907111de581f5cd2dc3640",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_KeyPairQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_KeyPairQuery(\n  $accessKey: String!\n) {\n  keypair(access_key: $accessKey) {\n    id\n    resource_policy\n    concurrency_used\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8f5c91f0fc46a3366f57566ab688d81";

export default node;
