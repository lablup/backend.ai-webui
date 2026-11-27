/**
 * @generated SignedSource<<5a128957b72f598b6012fcc4a33c5e83>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourcePolicyV2Mutation$variables = {
  id: string;
};
export type ProjectResourcePolicyV2Mutation$data = {
  readonly purgeProjectResourcePolicyV2: {
    readonly entityId: string;
  };
};
export type ProjectResourcePolicyV2Mutation = {
  response: ProjectResourcePolicyV2Mutation$data;
  variables: ProjectResourcePolicyV2Mutation$variables;
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
    "concreteType": "PurgeProjectResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "purgeProjectResourcePolicyV2",
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
    "name": "ProjectResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f15a667b44da609449b7f2b7c9973a8d",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyV2Mutation(\n  $id: UUID!\n) {\n  purgeProjectResourcePolicyV2(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "60160e2d5253eb70648c794704d79765";

export default node;
