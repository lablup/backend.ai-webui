/**
 * @generated SignedSource<<c7d72188997eda1b6ca203fefa0c156d>>
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
export type AdminUserCredentialListModifyMutation$variables = {
  input: AdminUpdateKeypairInput;
};
export type AdminUserCredentialListModifyMutation$data = {
  readonly adminUpdateKeypairV2: {
    readonly keypair: {
      readonly id: string;
    };
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
    "cacheID": "29ea604629e460b632896aa7d868decd",
    "id": null,
    "metadata": {},
    "name": "AdminUserCredentialListModifyMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserCredentialListModifyMutation(\n  $input: AdminUpdateKeypairInput!\n) {\n  adminUpdateKeypairV2(input: $input) {\n    keypair {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "115ce59ac2e0ccb4eb10d52366bdf693";

export default node;
