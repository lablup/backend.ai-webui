/**
 * @generated SignedSource<<23afcaeae5419d48f3b55de0d1e3a2ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminCreateKeypairInput = {
  isActive?: boolean;
  isAdmin?: boolean;
  rateLimit?: number;
  resourcePolicy: string;
  userId: string;
};
export type KeypairSettingModalCreateMutation$variables = {
  input: AdminCreateKeypairInput;
};
export type KeypairSettingModalCreateMutation$data = {
  readonly adminCreateKeypairV2: {
    readonly keypair: {
      readonly accessKey: string;
      readonly id: string;
    };
  } | null | undefined;
};
export type KeypairSettingModalCreateMutation = {
  response: KeypairSettingModalCreateMutation$data;
  variables: KeypairSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "AdminCreateKeypairPayload",
    "kind": "LinkedField",
    "name": "adminCreateKeypairV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairV2",
        "kind": "LinkedField",
        "name": "keypair",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "accessKey",
            "storageKey": null
          }
        ],
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
    "name": "KeypairSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "cb68541891bd8cecf26a8833e82a8710",
    "id": null,
    "metadata": {},
    "name": "KeypairSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairSettingModalCreateMutation(\n  $input: AdminCreateKeypairInput!\n) {\n  adminCreateKeypairV2(input: $input) {\n    keypair {\n      id\n      accessKey\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "851c5fa0a11f1fb7471137eb6dedd2c8";

export default node;
