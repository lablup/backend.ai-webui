/**
 * @generated SignedSource<<2ac0b93152682fc09bb847c1f6a01aba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomizedImageListForgetMutation$variables = {
  id: string;
};
export type CustomizedImageListForgetMutation$data = {
  readonly deleteImage: {
    readonly item: {
      readonly id: string;
    };
  };
};
export type CustomizedImageListForgetMutation = {
  response: CustomizedImageListForgetMutation$data;
  variables: CustomizedImageListForgetMutation$variables;
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
    "concreteType": "DeleteImagePayload",
    "kind": "LinkedField",
    "name": "deleteImage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "item",
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
    "name": "CustomizedImageListForgetMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CustomizedImageListForgetMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "62d4b7aca1530b345015d358a5968139",
    "id": null,
    "metadata": {},
    "name": "CustomizedImageListForgetMutation",
    "operationKind": "mutation",
    "text": "mutation CustomizedImageListForgetMutation(\n  $id: UUID!\n) {\n  deleteImage(id: $id) {\n    item {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "34937dbb8189c2b1f756797517d4cc7c";

export default node;
