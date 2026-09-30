/**
 * @generated SignedSource<<466b1fd84e697bddb8f896395f3bf151>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type hooksUsingRelay_KeyPairResourcePolicyQuery$variables = {
  name: string;
  supportsResourcePolicyV2: boolean;
};
export type hooksUsingRelay_KeyPairResourcePolicyQuery$data = {
  readonly keypair_resource_policy?: {
    readonly max_concurrent_sessions: number | null | undefined;
    readonly max_containers_per_session: number | null | undefined;
  } | null | undefined;
  readonly myKeypairResourcePolicyV2?: {
    readonly maxConcurrentSessions: number;
    readonly maxContainersPerSession: number;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsResourcePolicyV2"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxContainersPerSession",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxConcurrentSessions",
  "storageKey": null
},
v3 = {
  "condition": "supportsResourcePolicyV2",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
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
  ]
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": [
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myKeypairResourcePolicyV2",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      (v3/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "selections": [
      {
        "condition": "supportsResourcePolicyV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2",
            "kind": "LinkedField",
            "name": "myKeypairResourcePolicyV2",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
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
      (v3/*: any*/)
    ]
  },
  "params": {
    "cacheID": "a557238fcaf2535955758c199ca3c482",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_KeyPairResourcePolicyQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_KeyPairResourcePolicyQuery(\n  $name: String!\n  $supportsResourcePolicyV2: Boolean!\n) {\n  myKeypairResourcePolicyV2 @include(if: $supportsResourcePolicyV2) @since(version: \"26.4.2\") {\n    maxContainersPerSession\n    maxConcurrentSessions\n    id\n  }\n  keypair_resource_policy(name: $name) @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    max_containers_per_session\n    max_concurrent_sessions\n  }\n}\n"
  }
};
})();

(node as any).hash = "56cb6c4015aa24bae2ddbdbf2b5ba1d1";

export default node;
