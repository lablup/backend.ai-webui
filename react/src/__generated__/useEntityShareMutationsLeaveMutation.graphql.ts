/**
 * @generated SignedSource<<fa7870603e997838fedd314c26f3b91a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useEntityShareMutationsLeaveMutation$variables = {
  id: string;
};
export type useEntityShareMutationsLeaveMutation$data = {
  readonly leaveEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type useEntityShareMutationsLeaveMutation = {
  response: useEntityShareMutationsLeaveMutation$data;
  variables: useEntityShareMutationsLeaveMutation$variables;
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
    "name": "leaveEntityShare",
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
    "name": "useEntityShareMutationsLeaveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useEntityShareMutationsLeaveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "13c723c9bbde520fce246a228baf7f5b",
    "id": null,
    "metadata": {},
    "name": "useEntityShareMutationsLeaveMutation",
    "operationKind": "mutation",
    "text": "mutation useEntityShareMutationsLeaveMutation(\n  $id: UUID!\n) {\n  leaveEntityShare(id: $id) {\n    share {\n      id\n      status\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4e5b7a681dfe3e9dc12c89ec102180ed";

export default node;
