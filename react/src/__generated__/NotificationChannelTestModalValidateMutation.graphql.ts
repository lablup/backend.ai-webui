/**
 * @generated SignedSource<<d521997a4fdace1c0e0549297b8d55d7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ValidateNotificationChannelInput = {
  id: string;
  testMessage: string;
};
export type NotificationChannelTestModalValidateMutation$variables = {
  input: ValidateNotificationChannelInput;
};
export type NotificationChannelTestModalValidateMutation$data = {
  readonly adminValidateNotificationChannel: {
    readonly id: string;
  } | null | undefined;
};
export type NotificationChannelTestModalValidateMutation = {
  response: NotificationChannelTestModalValidateMutation$data;
  variables: NotificationChannelTestModalValidateMutation$variables;
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
    "concreteType": "ValidateNotificationChannelPayload",
    "kind": "LinkedField",
    "name": "adminValidateNotificationChannel",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
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
    "name": "NotificationChannelTestModalValidateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationChannelTestModalValidateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "46f51da1fb560aaa43c72f1345e099f9",
    "id": null,
    "metadata": {},
    "name": "NotificationChannelTestModalValidateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationChannelTestModalValidateMutation(\n  $input: ValidateNotificationChannelInput!\n) {\n  adminValidateNotificationChannel(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "03f47d863d644f245a010cb796433ec5";

export default node;
