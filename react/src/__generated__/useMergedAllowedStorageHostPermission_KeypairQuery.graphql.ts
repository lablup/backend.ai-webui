/**
 * @generated SignedSource<<2262b0f6dd81bd5b84853167145245ab>>
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
};
export type useMergedAllowedStorageHostPermission_KeypairQuery$data = {
  readonly keypair: {
    readonly resource_policy: string;
  };
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
v2 = [
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
v3 = {
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": (v2/*: any*/),
          "concreteType": "KeyPair",
          "kind": "LinkedField",
          "name": "keypair",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": (v3/*: any*/),
              "action": "THROW"
            }
          ],
          "storageKey": null
        },
        "action": "THROW"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "KeyPair",
        "kind": "LinkedField",
        "name": "keypair",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
    "cacheID": "05bd7db7ab185940108fba3f2cadc989",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_KeypairQuery(\n  $domainName: String\n  $accessKey: String\n) {\n  keypair(domain_name: $domainName, access_key: $accessKey) {\n    resource_policy\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "bca5af88ccf1508389ec648bf31c4965";

export default node;
