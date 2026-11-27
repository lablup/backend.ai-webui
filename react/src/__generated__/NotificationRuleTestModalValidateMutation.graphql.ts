/**
 * @generated SignedSource<<3af03b582dc2d63a012180d7a13d48dc>>
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
export type NotificationRuleTestModalValidateMutation$variables = {
  input: ValidateNotificationRuleInput;
};
export type NotificationRuleTestModalValidateMutation$data = {
  readonly adminValidateNotificationRule: {
    readonly message: string;
  } | null | undefined;
};
export type NotificationRuleTestModalValidateMutation = {
  response: NotificationRuleTestModalValidateMutation$data;
  variables: NotificationRuleTestModalValidateMutation$variables;
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
    "name": "NotificationRuleTestModalValidateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleTestModalValidateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "72db6432aa910ed5d71abbaa3bd8510a",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleTestModalValidateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleTestModalValidateMutation(\n  $input: ValidateNotificationRuleInput!\n) {\n  adminValidateNotificationRule(input: $input) {\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e3b7b73a724c795540b1ce28bb61c36";

export default node;
