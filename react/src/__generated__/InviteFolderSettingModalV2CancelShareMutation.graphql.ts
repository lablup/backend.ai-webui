/**
 * @generated SignedSource<<4c54ed9c970ab2197a0e3c983c8aa927>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type InviteFolderSettingModalV2CancelShareMutation$variables = {
  id: string;
};
export type InviteFolderSettingModalV2CancelShareMutation$data = {
  readonly cancelEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalV2CancelShareMutation = {
  response: InviteFolderSettingModalV2CancelShareMutation$data;
  variables: InviteFolderSettingModalV2CancelShareMutation$variables;
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
    "name": "InviteFolderSettingModalV2CancelShareMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InviteFolderSettingModalV2CancelShareMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e6ba2a6e766045860efef4ad9aa59cd4",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalV2CancelShareMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalV2CancelShareMutation(\n  $id: UUID!\n) {\n  cancelEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f2d49ec608bdff9e5e4c289cec9a0ff";

export default node;
