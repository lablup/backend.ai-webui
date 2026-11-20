/**
 * @generated SignedSource<<0740d0767f5bf6beb39b3e88d349b32d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationChannelListPurgeMutation$variables = {
  id: string;
};
export type NotificationChannelListPurgeMutation$data = {
  readonly purgeNotificationChannel: {
    readonly entityId: string;
    readonly purgedId: string;
  };
};
export type NotificationChannelListPurgeMutation = {
  response: NotificationChannelListPurgeMutation$data;
  variables: NotificationChannelListPurgeMutation$variables;
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
    "concreteType": "PurgeNotificationChannelPayload",
    "kind": "LinkedField",
    "name": "purgeNotificationChannel",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
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
    "name": "NotificationChannelListPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelListPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "993ef9449c18a107f0e1eb2d06175848",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelListPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelListPurgeMutation(\n  $id: UUID!\n) {\n  purgeNotificationChannel(id: $id) {\n    purgedId\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5f969ca4cb98e1939f5c4f23536767c";

export default node;
