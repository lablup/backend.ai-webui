/**
 * @generated SignedSource<<20a5f2ce1e7005e455dff00cf9bacabb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminRetentionPolicyDeleteMutation$variables = {
  id: string;
};
export type AdminRetentionPolicyDeleteMutation$data = {
  readonly purgeRetentionPolicy: {
    readonly entityId: string;
  };
};
export type AdminRetentionPolicyDeleteMutation = {
  response: AdminRetentionPolicyDeleteMutation$data;
  variables: AdminRetentionPolicyDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "PurgeRetentionPolicyPayload",
    "kind": "LinkedField",
    "name": "purgeRetentionPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
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
    "name": "AdminRetentionPolicyDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminRetentionPolicyDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b9028fcf3cb4560195eb0fcc28bedab6",
    "id": null,
    "metadata": {},
    "name": "AdminRetentionPolicyDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminRetentionPolicyDeleteMutation(\n  $id: UUID!\n) {\n  purgeRetentionPolicy(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "6163e35b44260a48d64ed3d6503021f5";

export default node;
