/**
 * @generated SignedSource<<7c94dc522c1569ddf60fb25edfe09c42>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ValidateNotificationRuleInput = {
  id: string;
  notificationData?: any | null | undefined;
};
export type NotificationRulePreviewModalValidateMutation$variables = {
  input: ValidateNotificationRuleInput;
};
export type NotificationRulePreviewModalValidateMutation$data = {
  readonly adminValidateNotificationRule: {
    readonly message: string;
  } | null | undefined;
};
export type NotificationRulePreviewModalValidateMutation = {
  response: NotificationRulePreviewModalValidateMutation$data;
  variables: NotificationRulePreviewModalValidateMutation$variables;
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
    "concreteType": "ValidateNotificationRulePayload",
    "kind": "LinkedField",
    "name": "adminValidateNotificationRule",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "message",
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
    "name": "NotificationRulePreviewModalValidateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRulePreviewModalValidateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0ac44078b2ca102363ae96c137b69ac1",
    "id": null,
    "metadata": {},
    "name": "NotificationRulePreviewModalValidateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRulePreviewModalValidateMutation(\n  $input: ValidateNotificationRuleInput!\n) {\n  adminValidateNotificationRule(input: $input) {\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "669796798671df747971a6f9fb66cd18";

export default node;
