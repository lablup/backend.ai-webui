/**
 * @generated SignedSource<<cbc83b1a07ddc049a0ce4ea2ea9c06f1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useEntityShareMutationsRejectMutation$variables = {
  id: string;
};
export type useEntityShareMutationsRejectMutation$data = {
  readonly rejectEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type useEntityShareMutationsRejectMutation = {
  response: useEntityShareMutationsRejectMutation$data;
  variables: useEntityShareMutationsRejectMutation$variables;
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
    "concreteType": "EntitySharePayload",
    "kind": "LinkedField",
    "name": "rejectEntityShare",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntityShare",
        "kind": "LinkedField",
        "name": "share",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
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
    "name": "useEntityShareMutationsRejectMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useEntityShareMutationsRejectMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3d9fe23c8e76b08b3e6ccf6dca997b63",
    "id": null,
    "metadata": {},
    "name": "useEntityShareMutationsRejectMutation",
    "operationKind": "mutation",
    "text": "mutation useEntityShareMutationsRejectMutation(\n  $id: UUID!\n) {\n  rejectEntityShare(id: $id) {\n    share {\n      id\n      status\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e9e7453f966f83f02dd85b824fc1fbb";

export default node;
