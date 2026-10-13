/**
 * @generated SignedSource<<dc0c103977455b91a83f332b6fd40864>>
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
  readonly adminDeleteRetentionPolicy: {
    readonly id: string;
  } | null | undefined;
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
    "concreteType": "DeleteRetentionPolicyPayload",
    "kind": "LinkedField",
    "name": "adminDeleteRetentionPolicy",
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
    "cacheID": "db275fd1b56d8af75bc028102eb630d0",
    "id": null,
    "metadata": {},
    "name": "AdminRetentionPolicyDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminRetentionPolicyDeleteMutation(\n  $id: UUID!\n) {\n  adminDeleteRetentionPolicy(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c16a5564da596d6035573a03b3d2deb";

export default node;
