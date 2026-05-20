/**
 * @generated SignedSource<<85d57aafb44a4130025918b95d98cac5>>
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
export type UserCredentialListModifyMutation$variables = {
  access_key: string;
  props: ModifyKeyPairInput;
};
export type UserCredentialListModifyMutation$data = {
  readonly modify_keypair: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserCredentialListModifyMutation = {
  response: UserCredentialListModifyMutation$data;
  variables: UserCredentialListModifyMutation$variables;
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
    "name": "UserCredentialListModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserCredentialListModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "49292a75a914ad1eeb6f8e2667974b95",
    "id": null,
    "metadata": {},
    "name": "UserCredentialListModifyMutation",
    "operationKind": "mutation",
    "text": "mutation UserCredentialListModifyMutation(\n  $access_key: String!\n  $props: ModifyKeyPairInput!\n) {\n  modify_keypair(access_key: $access_key, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "b3504d39bac9dd8ac749460ba5e510c0";

export default node;
