/**
 * @generated SignedSource<<e42d73b3cd7ba1f73cc649babd458b55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type InviteFolderSettingModalCancelShareMutation$variables = {
  id: string;
};
export type InviteFolderSettingModalCancelShareMutation$data = {
  readonly cancelEntityShare: {
    readonly share: {
      readonly id: string;
      readonly status: EntityShareStatus;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalCancelShareMutation = {
  response: InviteFolderSettingModalCancelShareMutation$data;
  variables: InviteFolderSettingModalCancelShareMutation$variables;
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
    "name": "InviteFolderSettingModalCancelShareMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InviteFolderSettingModalCancelShareMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ab05deae0f3dc5cb1759759f90c2ced9",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalCancelShareMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalCancelShareMutation(\n  $id: UUID!\n) {\n  cancelEntityShare(id: $id) {\n    share {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "334c856cfe0d267fe81a76c8696ec3c4";

export default node;
