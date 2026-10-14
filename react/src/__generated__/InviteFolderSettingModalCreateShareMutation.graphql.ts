/**
 * @generated SignedSource<<eff4d78c2e53d7a30bcc35a33e79aa4d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type CreateEntityShareInput = {
  permissions?: ReadonlyArray<PermissionBit>;
  recipient: EntityShareRecipientInput;
  targetEntityId: string;
  targetEntityType: string;
};
export type EntityShareRecipientInput = {
  email?: string | null | undefined;
  projectId?: string | null | undefined;
  userId?: string | null | undefined;
};
export type InviteFolderSettingModalCreateShareMutation$variables = {
  input: CreateEntityShareInput;
};
export type InviteFolderSettingModalCreateShareMutation$data = {
  readonly createEntityShare: {
    readonly share: {
      readonly entityId: string;
      readonly id: string;
      readonly recipientEmail: string | null | undefined;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalCreateShareMutation = {
  response: InviteFolderSettingModalCreateShareMutation$data;
  variables: InviteFolderSettingModalCreateShareMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "EntitySharePayload",
    "kind": "LinkedField",
    "name": "createEntityShare",
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
            "name": "entityId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "recipientEmail",
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
    "name": "InviteFolderSettingModalCreateShareMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InviteFolderSettingModalCreateShareMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6065896c47204e84f82eed2501d7b14e",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalCreateShareMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalCreateShareMutation(\n  $input: CreateEntityShareInput!\n) {\n  createEntityShare(input: $input) {\n    share {\n      id\n      entityId\n      recipientEmail\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7415e2ddb3d0796a92891c5d2002fd56";

export default node;
