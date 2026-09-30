/**
 * @generated SignedSource<<4f1b9d2158e8296efbbbec10f19757db>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedStorageHostPermission_KeypairQuery$variables = {
  accessKey?: string | null | undefined;
  domainName?: string | null | undefined;
  skipKeypair: boolean;
};
export type useMergedAllowedStorageHostPermission_KeypairQuery$data = {
  readonly keypair?: {
    readonly resource_policy: string | null | undefined;
  } | null | undefined;
};
export type useMergedAllowedStorageHostPermission_KeypairQuery = {
  response: useMergedAllowedStorageHostPermission_KeypairQuery$data;
  variables: useMergedAllowedStorageHostPermission_KeypairQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accessKey"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipKeypair"
},
v3 = [
  {
    "kind": "Variable",
    "name": "access_key",
    "variableName": "accessKey"
  },
  {
    "kind": "Variable",
    "name": "domain_name",
    "variableName": "domainName"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
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
            "args": (v3/*: any*/),
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v4/*: any*/)
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
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
            "args": (v3/*: any*/),
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              (v4/*: any*/),
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
    "cacheID": "eb39af3f79bf43ac123f438cfccf5e2b",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_KeypairQuery(\n  $domainName: String\n  $accessKey: String\n  $skipKeypair: Boolean!\n) {\n  keypair(domain_name: $domainName, access_key: $accessKey) @skip(if: $skipKeypair) {\n    resource_policy\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0241befc32a960ea545b404cd488184f";

export default node;
