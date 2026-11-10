/**
 * @generated SignedSource<<090116a97e12626471e463aadc9fd63e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyV2Mutation$variables = {
  id: string;
};
export type KeypairResourcePolicyV2Mutation$data = {
  readonly purgeKeypairResourcePolicyV2: {
    readonly entityId: string;
  };
};
export type KeypairResourcePolicyV2Mutation = {
  response: KeypairResourcePolicyV2Mutation$data;
  variables: KeypairResourcePolicyV2Mutation$variables;
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
    "concreteType": "PurgeKeypairResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "purgeKeypairResourcePolicyV2",
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
    "name": "KeypairResourcePolicyV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5769effe6001aac23d922c5c29a8d165",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyV2Mutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyV2Mutation(\n  $id: UUID!\n) {\n  purgeKeypairResourcePolicyV2(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "d2d8a7918184eda64abd73283effc631";

export default node;
