/**
 * @generated SignedSource<<765e16ea404a3aec7f489631fdf6e5cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type InviteFolderSettingModalRevokeShareMutation$variables = {
  id: string;
};
export type InviteFolderSettingModalRevokeShareMutation$data = {
  readonly revokeEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalRevokeShareMutation = {
  response: InviteFolderSettingModalRevokeShareMutation$data;
  variables: InviteFolderSettingModalRevokeShareMutation$variables;
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
    "name": "InviteFolderSettingModalRevokeShareMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InviteFolderSettingModalRevokeShareMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a5028967bec2ea3ace60641b3bd43238",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalRevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalRevokeShareMutation(\n  $id: UUID!\n) {\n  revokeEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "459dd6b20006e5044ddd91b56c7665d6";

export default node;
