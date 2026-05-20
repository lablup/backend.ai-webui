/**
 * @generated SignedSource<<390b5f0f16c95f40af02790daa6eae96>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MyKeypairManagementModalIssueMyKeypairMutation$variables = Record<PropertyKey, never>;
export type MyKeypairManagementModalIssueMyKeypairMutation$data = {
  readonly issueMyKeypair: {
    readonly keypair: {
      readonly accessKey: string;
      readonly sshPublicKey: string | null | undefined;
    };
    readonly secretKey: string;
  } | null | undefined;
};
export type MyKeypairManagementModalIssueMyKeypairMutation = {
  response: MyKeypairManagementModalIssueMyKeypairMutation$data;
  variables: MyKeypairManagementModalIssueMyKeypairMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "accessKey",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sshPublicKey",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "secretKey",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "MyKeypairManagementModalIssueMyKeypairMutation",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "IssueMyKeypairPayload",
        "kind": "LinkedField",
        "name": "issueMyKeypair",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairGQL",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "MyKeypairManagementModalIssueMyKeypairMutation",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "IssueMyKeypairPayload",
        "kind": "LinkedField",
        "name": "issueMyKeypair",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairGQL",
            "kind": "LinkedField",
            "name": "keypair",
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
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "773eb00f18b760e805cb822fd0f51cbd",
    "id": null,
    "metadata": {},
    "name": "MyKeypairManagementModalIssueMyKeypairMutation",
    "operationKind": "mutation",
    "text": "mutation MyKeypairManagementModalIssueMyKeypairMutation {\n  issueMyKeypair {\n    keypair {\n      accessKey\n      sshPublicKey\n      id\n    }\n    secretKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "b8a4f4b12f76df7eb4e21e235d68abfd";

export default node;
