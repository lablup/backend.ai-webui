/**
 * @generated SignedSource<<e1c4f9406d41ec072f735b7283f48327>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useVFolderInvitationsAcceptMutation$variables = {
  id: string;
};
export type useVFolderInvitationsAcceptMutation$data = {
  readonly acceptEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type useVFolderInvitationsAcceptMutation = {
  response: useVFolderInvitationsAcceptMutation$data;
  variables: useVFolderInvitationsAcceptMutation$variables;
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
    "name": "useVFolderInvitationsAcceptMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useVFolderInvitationsAcceptMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4a9451b7f9a52cf6f07818ba62216b2e",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsAcceptMutation",
    "operationKind": "mutation",
    "text": "mutation useVFolderInvitationsAcceptMutation(\n  $id: UUID!\n) {\n  acceptEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "19aeb7a0dc8935ae11ab278a3972c9e5";

export default node;
