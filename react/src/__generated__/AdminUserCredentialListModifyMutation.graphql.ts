/**
 * @generated SignedSource<<b5f0a1dc21ebb8484d9c4bbd6c9c4883>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyKeyPairInput = {
  concurrency_limit?: number | null | undefined;
  is_active?: boolean | null | undefined;
  is_admin?: boolean | null | undefined;
  rate_limit?: number | null | undefined;
  resource_policy?: string | null | undefined;
};
export type AdminUserCredentialListModifyMutation$variables = {
  access_key: string;
  props: ModifyKeyPairInput;
};
export type AdminUserCredentialListModifyMutation$data = {
  readonly modify_keypair: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type AdminUserCredentialListModifyMutation = {
  response: AdminUserCredentialListModifyMutation$data;
  variables: AdminUserCredentialListModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "access_key"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
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
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyKeyPair",
    "kind": "LinkedField",
    "name": "modify_keypair",
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
    "name": "AdminUserCredentialListModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminUserCredentialListModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ab00fbd53ee7b0aeb266bbc87c7b653b",
    "id": null,
    "metadata": {},
    "name": "AdminUserCredentialListModifyMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserCredentialListModifyMutation(\n  $access_key: String!\n  $props: ModifyKeyPairInput!\n) {\n  modify_keypair(access_key: $access_key, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "86169244ef9796d1ba0b5d67e3682c70";

export default node;
