/**
 * @generated SignedSource<<7ddd5a822973ebc8e501f8cd67eadbe8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RetentionPolicyListDeleteMutation$variables = {
  id: string;
};
export type RetentionPolicyListDeleteMutation$data = {
  readonly adminDeleteRetentionPolicy: {
    readonly id: string;
  } | null | undefined;
};
export type RetentionPolicyListDeleteMutation = {
  response: RetentionPolicyListDeleteMutation$data;
  variables: RetentionPolicyListDeleteMutation$variables;
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
    "name": "RetentionPolicyListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicyListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "66605dd8475e57818b082064a0ace414",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicyListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation RetentionPolicyListDeleteMutation(\n  $id: UUID!\n) {\n  adminDeleteRetentionPolicy(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2bf164d503ca1e806c203cff898f297c";

export default node;
