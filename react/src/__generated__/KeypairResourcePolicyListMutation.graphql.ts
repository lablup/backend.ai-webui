/**
 * @generated SignedSource<<493329c639195ca83cc4270e7a392324>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyListMutation$variables = {
  name: string;
};
export type KeypairResourcePolicyListMutation$data = {
  readonly delete_keypair_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type KeypairResourcePolicyListMutation = {
  response: KeypairResourcePolicyListMutation$data;
  variables: KeypairResourcePolicyListMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "DeleteKeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "delete_keypair_resource_policy",
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
    "name": "KeypairResourcePolicyListMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyListMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fe182323e364c317f26c7193239af22b",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyListMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyListMutation(\n  $name: String!\n) {\n  delete_keypair_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "5771729a12a204d27a9cdf5ad31e707f";

export default node;
