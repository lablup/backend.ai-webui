/**
 * @generated SignedSource<<437045884f7adef29ad6d0da4212e239>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type useVFolderInvitationsRejectMutation$variables = {
  id: string;
};
export type useVFolderInvitationsRejectMutation$data = {
  readonly rejectEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type useVFolderInvitationsRejectMutation = {
  response: useVFolderInvitationsRejectMutation$data;
  variables: useVFolderInvitationsRejectMutation$variables;
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
    "name": "useVFolderInvitationsRejectMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useVFolderInvitationsRejectMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "702788d6c1431143aa5967a70949afa0",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsRejectMutation",
    "operationKind": "mutation",
    "text": "mutation useVFolderInvitationsRejectMutation(\n  $id: UUID!\n) {\n  rejectEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "62fe2c960f93031827ca05e2f8135f88";

export default node;
