/**
 * @generated SignedSource<<6c3fc9f150985193dec136fe11bc3eeb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminUserCredentialListDeleteMutation$variables = {
  access_key: string;
};
export type AdminUserCredentialListDeleteMutation$data = {
  readonly delete_keypair: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type AdminUserCredentialListDeleteMutation = {
  response: AdminUserCredentialListDeleteMutation$data;
  variables: AdminUserCredentialListDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "access_key"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "access_key",
        "variableName": "access_key"
      }
    ],
    "concreteType": "DeleteKeyPair",
    "kind": "LinkedField",
    "name": "delete_keypair",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "AdminUserCredentialListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminUserCredentialListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5d4c0a30295544e357a1da7cf1054b67",
    "id": null,
    "metadata": {},
    "name": "AdminUserCredentialListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserCredentialListDeleteMutation(\n  $access_key: String!\n) {\n  delete_keypair(access_key: $access_key) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "06f98aed67b19b9454aaaefcc9d5bb8e";

export default node;
