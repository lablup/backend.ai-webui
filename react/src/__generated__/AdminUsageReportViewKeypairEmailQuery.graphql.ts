/**
 * @generated SignedSource<<95950a4ff18899a88c8ba3e549e38caf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminUsageReportViewKeypairEmailQuery$variables = {
  accessKey: string;
};
export type AdminUsageReportViewKeypairEmailQuery$data = {
  readonly keypair: {
    readonly user_id: string | null | undefined;
  } | null | undefined;
};
export type AdminUsageReportViewKeypairEmailQuery = {
  response: AdminUsageReportViewKeypairEmailQuery$data;
  variables: AdminUsageReportViewKeypairEmailQuery$variables;
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
    "kind": "Variable",
    "name": "access_key",
    "variableName": "accessKey"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUsageReportViewKeypairEmailQuery",
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminUsageReportViewKeypairEmailQuery",
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
  },
  "params": {
    "cacheID": "7bd5fc600891d8f43ce9a00f42e26c51",
    "id": null,
    "metadata": {},
    "name": "AdminUsageReportViewKeypairEmailQuery",
    "operationKind": "query",
    "text": "query AdminUsageReportViewKeypairEmailQuery(\n  $accessKey: String!\n) {\n  keypair(access_key: $accessKey) {\n    user_id\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a59ba16d77536a4d00495693a60743ea";

export default node;
