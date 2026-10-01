/**
 * @generated SignedSource<<d9d5f276c67e0524367cb1dd9c4484a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useEntityShareMutationsRevokeMutation$variables = {
  id: string;
};
export type useEntityShareMutationsRevokeMutation$data = {
  readonly revokeEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type useEntityShareMutationsRevokeMutation = {
  response: useEntityShareMutationsRevokeMutation$data;
  variables: useEntityShareMutationsRevokeMutation$variables;
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
    "name": "revokeEntityShare",
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
    "name": "useEntityShareMutationsRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useEntityShareMutationsRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "aedba5ec4f424ff968fb031fcc74a9b2",
    "id": null,
    "metadata": {},
    "name": "useEntityShareMutationsRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation useEntityShareMutationsRevokeMutation(\n  $id: UUID!\n) {\n  revokeEntityShare(id: $id) {\n    share {\n      id\n      status\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eb95b259ded8354d1bee5d0f02c5248f";

export default node;
