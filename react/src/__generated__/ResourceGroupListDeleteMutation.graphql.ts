/**
 * @generated SignedSource<<d8bacdd54a7a3602d1b9b913a2843b51>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupListDeleteMutation$variables = {
  id: string;
};
export type ResourceGroupListDeleteMutation$data = {
  readonly purgeResourceGroupV2: {
    readonly entityId: string;
  };
};
export type ResourceGroupListDeleteMutation = {
  response: ResourceGroupListDeleteMutation$data;
  variables: ResourceGroupListDeleteMutation$variables;
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
    "concreteType": "PurgeResourceGroupPayload",
    "kind": "LinkedField",
    "name": "purgeResourceGroupV2",
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
    "name": "ResourceGroupListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ecfca1f9d94242762809e448e86faa19",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupListDeleteMutation(\n  $id: UUID!\n) {\n  purgeResourceGroupV2(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce8aaa6e694ff818a21d515d2cf6c1f3";

export default node;
