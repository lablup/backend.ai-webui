/**
 * @generated SignedSource<<f9365a967df7f5e68483bef061e1986d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type SharedFolderPermissionInfoModalV2LeaveMutation$variables = {
  id: string;
};
export type SharedFolderPermissionInfoModalV2LeaveMutation$data = {
  readonly leaveEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2LeaveMutation = {
  response: SharedFolderPermissionInfoModalV2LeaveMutation$data;
  variables: SharedFolderPermissionInfoModalV2LeaveMutation$variables;
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
    "name": "SharedFolderPermissionInfoModalV2LeaveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SharedFolderPermissionInfoModalV2LeaveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dc9e7d693d58554f67977f9ce7d4b0cf",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2LeaveMutation",
    "operationKind": "mutation",
    "text": "mutation SharedFolderPermissionInfoModalV2LeaveMutation(\n  $id: UUID!\n) {\n  leaveEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "77407a34e7d05ee7e98a82314f65d52b";

export default node;
