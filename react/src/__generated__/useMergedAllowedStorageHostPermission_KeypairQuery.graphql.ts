/**
 * @generated SignedSource<<965578327f2b448ffcb6a2da3a974bd3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedStorageHostPermission_KeypairQuery$variables = {
  accessKey: string;
  skipKeypair: boolean;
};
export type useMergedAllowedStorageHostPermission_KeypairQuery$data = {
  readonly adminKeypairV2?: {
    readonly resourcePolicy: string;
  } | null | undefined;
};
export type useMergedAllowedStorageHostPermission_KeypairQuery = {
  response: useMergedAllowedStorageHostPermission_KeypairQuery$data;
  variables: useMergedAllowedStorageHostPermission_KeypairQuery$variables;
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
    "name": "accessKey",
    "variableName": "accessKey"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourcePolicy",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      {
        "condition": "skipKeypair",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "KeyPairV2",
            "kind": "LinkedField",
            "name": "adminKeypairV2",
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
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      {
        "condition": "skipKeypair",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "KeyPairV2",
            "kind": "LinkedField",
            "name": "adminKeypairV2",
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
    "cacheID": "f19395c3583c736e0079849c854cf7bb",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_KeypairQuery(\n  $accessKey: String!\n  $skipKeypair: Boolean!\n) {\n  adminKeypairV2(accessKey: $accessKey) @skip(if: $skipKeypair) {\n    resourcePolicy\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ad997c1913cbcb02e83fa7ca191a22c9";

export default node;
