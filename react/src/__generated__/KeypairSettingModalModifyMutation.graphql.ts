/**
 * @generated SignedSource<<4399fbb670e6d03b162fce06d49d280e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminUpdateKeypairInput = {
  accessKey: string;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  rateLimit?: number | null | undefined;
  resourcePolicy?: string | null | undefined;
};
export type KeypairSettingModalModifyMutation$variables = {
  input: AdminUpdateKeypairInput;
};
export type KeypairSettingModalModifyMutation$data = {
  readonly adminUpdateKeypairV2: {
    readonly keypair: {
      readonly id: string;
    };
  } | null | undefined;
};
export type KeypairSettingModalModifyMutation = {
  response: KeypairSettingModalModifyMutation$data;
  variables: KeypairSettingModalModifyMutation$variables;
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
    "concreteType": "AdminUpdateKeypairPayload",
    "kind": "LinkedField",
    "name": "adminUpdateKeypairV2",
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
    "name": "KeypairSettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairSettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e32e2e4842ca8b34f1da33b1b5c87918",
    "id": null,
    "metadata": {},
    "name": "KeypairSettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairSettingModalModifyMutation(\n  $input: AdminUpdateKeypairInput!\n) {\n  adminUpdateKeypairV2(input: $input) {\n    keypair {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "098d0a086494f60cc6d9717d653f668e";

export default node;
