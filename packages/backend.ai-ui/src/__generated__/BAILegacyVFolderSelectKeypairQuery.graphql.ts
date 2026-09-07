/**
 * @generated SignedSource<<b60c781e0f3af3c995dc6b28d959ccc4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAILegacyVFolderSelectKeypairQuery$variables = {
  accessKey: string;
  skipKeypair: boolean;
};
export type BAILegacyVFolderSelectKeypairQuery$data = {
  readonly keypair?: {
    readonly resource_policy: string | null | undefined;
  } | null | undefined;
};
export type BAILegacyVFolderSelectKeypairQuery = {
  response: BAILegacyVFolderSelectKeypairQuery$data;
  variables: BAILegacyVFolderSelectKeypairQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "accessKey"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipKeypair"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "access_key",
    "variableName": "accessKey"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAILegacyVFolderSelectKeypairQuery",
    "selections": [
      {
        "condition": "skipKeypair",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAILegacyVFolderSelectKeypairQuery",
    "selections": [
      {
        "condition": "skipKeypair",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
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
      }
    ]
  },
  "params": {
    "cacheID": "d8f5ba182c5303c67a68fa4c6eff5386",
    "id": null,
    "metadata": {},
    "name": "BAILegacyVFolderSelectKeypairQuery",
    "operationKind": "query",
    "text": "query BAILegacyVFolderSelectKeypairQuery(\n  $accessKey: String!\n  $skipKeypair: Boolean!\n) {\n  keypair(access_key: $accessKey) @skip(if: $skipKeypair) {\n    resource_policy\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5546a0232fb61b14dac02dd7d289d462";

export default node;
