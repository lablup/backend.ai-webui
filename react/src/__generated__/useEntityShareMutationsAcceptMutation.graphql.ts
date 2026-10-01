/**
 * @generated SignedSource<<866b658f57f5f6c1abb7ae10db57c567>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useEntityShareMutationsAcceptMutation$variables = {
  id: string;
};
export type useEntityShareMutationsAcceptMutation$data = {
  readonly acceptEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type useEntityShareMutationsAcceptMutation = {
  response: useEntityShareMutationsAcceptMutation$data;
  variables: useEntityShareMutationsAcceptMutation$variables;
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
    "name": "acceptEntityShare",
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
    "name": "useEntityShareMutationsAcceptMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useEntityShareMutationsAcceptMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2a62c7d742696d7953a1acdfffeb7001",
    "id": null,
    "metadata": {},
    "name": "useEntityShareMutationsAcceptMutation",
    "operationKind": "mutation",
    "text": "mutation useEntityShareMutationsAcceptMutation(\n  $id: UUID!\n) {\n  acceptEntityShare(id: $id) {\n    share {\n      id\n      status\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c43f971523f1413ceacd768aefab1e36";

export default node;
