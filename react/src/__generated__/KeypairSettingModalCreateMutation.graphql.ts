/**
 * @generated SignedSource<<047955301c254bee6f71f7f9dedc79ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeyPairInput = {
  concurrency_limit?: number | null | undefined;
  is_active?: boolean | null | undefined;
  is_admin?: boolean | null | undefined;
  rate_limit: number;
  resource_policy: string;
};
export type KeypairSettingModalCreateMutation$variables = {
  props: KeyPairInput;
  user_id: string;
};
export type KeypairSettingModalCreateMutation$data = {
  readonly create_keypair: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type KeypairSettingModalCreateMutation = {
  response: KeypairSettingModalCreateMutation$data;
  variables: KeypairSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "props"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_id"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      },
      {
        "kind": "Variable",
        "name": "user_id",
        "variableName": "user_id"
      }
    ],
    "concreteType": "CreateKeyPair",
    "kind": "LinkedField",
    "name": "create_keypair",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairSettingModalCreateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "KeypairSettingModalCreateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2911946ae5cad21bdff21cc88cf64c74",
    "id": null,
    "metadata": {},
    "name": "KeypairSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairSettingModalCreateMutation(\n  $user_id: String!\n  $props: KeyPairInput!\n) {\n  create_keypair(user_id: $user_id, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "a81bb2d7d4e5a095deaf58a442f4211d";

export default node;
