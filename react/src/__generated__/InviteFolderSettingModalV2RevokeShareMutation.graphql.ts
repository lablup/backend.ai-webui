/**
 * @generated SignedSource<<87b6cdb49282b364fd51fedd4521e52f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type InviteFolderSettingModalV2RevokeShareMutation$variables = {
  id: string;
};
export type InviteFolderSettingModalV2RevokeShareMutation$data = {
  readonly revokeEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalV2RevokeShareMutation = {
  response: InviteFolderSettingModalV2RevokeShareMutation$data;
  variables: InviteFolderSettingModalV2RevokeShareMutation$variables;
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
    "name": "InviteFolderSettingModalV2RevokeShareMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InviteFolderSettingModalV2RevokeShareMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3920b57ce1563783ea78e80c5d76ffdf",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalV2RevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalV2RevokeShareMutation(\n  $id: UUID!\n) {\n  revokeEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "247fad6c8f6a9cdcdeeae31c8c7e629a";

export default node;
