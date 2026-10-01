/**
 * @generated SignedSource<<5d84dc7638eb9fe67d75affbade8c043>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useEntityShareMutationsCancelMutation$variables = {
  id: string;
};
export type useEntityShareMutationsCancelMutation$data = {
  readonly cancelEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type useEntityShareMutationsCancelMutation = {
  response: useEntityShareMutationsCancelMutation$data;
  variables: useEntityShareMutationsCancelMutation$variables;
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
    "name": "cancelEntityShare",
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
    "name": "useEntityShareMutationsCancelMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useEntityShareMutationsCancelMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "70a219eb674fb13d26179a742d5f6f06",
    "id": null,
    "metadata": {},
    "name": "useEntityShareMutationsCancelMutation",
    "operationKind": "mutation",
    "text": "mutation useEntityShareMutationsCancelMutation(\n  $id: UUID!\n) {\n  cancelEntityShare(id: $id) {\n    share {\n      id\n      status\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "114a5d21be40426325c25975d9b44d53";

export default node;
