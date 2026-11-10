/**
 * @generated SignedSource<<e9a199ed86206735e67ea77339b83f7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicyV2Mutation$variables = {
  id: string;
};
export type UserResourcePolicyV2Mutation$data = {
  readonly purgeUserResourcePolicyV2: {
    readonly entityId: string;
    readonly purgedId: string;
  };
};
export type UserResourcePolicyV2Mutation = {
  response: UserResourcePolicyV2Mutation$data;
  variables: UserResourcePolicyV2Mutation$variables;
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
    "concreteType": "PurgeUserResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "purgeUserResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
        "storageKey": null
      },
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
    "name": "UserResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a32928b722a8f3eeea53cc5ce8917387",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyV2Mutation(\n  $id: UUID!\n) {\n  purgeUserResourcePolicyV2(id: $id) {\n    purgedId\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "6966f1469fb944551698102b07d8c0dc";

export default node;
