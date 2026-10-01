/**
 * @generated SignedSource<<46dbc4e374b3dc3cd97fa8f5c645290e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type hooksUsingRelay_KeyPairResourcePolicyQuery$variables = Record<PropertyKey, never>;
export type hooksUsingRelay_KeyPairResourcePolicyQuery$data = {
  readonly myKeypairResourcePolicyV2: {
    readonly maxConcurrentSessions: number;
    readonly maxContainersPerSession: number;
  } | null | undefined;
};
export type hooksUsingRelay_KeyPairResourcePolicyQuery = {
  response: hooksUsingRelay_KeyPairResourcePolicyQuery$data;
  variables: hooksUsingRelay_KeyPairResourcePolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxContainersPerSession",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxConcurrentSessions",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myKeypairResourcePolicyV2",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "myKeypairResourcePolicyV2",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "373d922f8adbf8f5db5799c6d3216165",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_KeyPairResourcePolicyQuery {\n  myKeypairResourcePolicyV2 {\n    maxContainersPerSession\n    maxConcurrentSessions\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8aa03eb436268e338b235b0b621ffa2b";

export default node;
