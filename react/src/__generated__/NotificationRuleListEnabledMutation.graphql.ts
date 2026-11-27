/**
 * @generated SignedSource<<d43e305cc28e329e04c2d65b03f3b1f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateNotificationRuleInput = {
  description?: string | null | undefined;
  enabled?: boolean | null | undefined;
  id: string;
  messageTemplate?: string | null | undefined;
  name?: string | null | undefined;
};
export type NotificationRuleListEnabledMutation$variables = {
  input: UpdateNotificationRuleInput;
};
export type NotificationRuleListEnabledMutation$data = {
  readonly updateNotificationRule: {
    readonly rule: {
      readonly enabled: boolean;
      readonly id: string;
    };
  } | null | undefined;
};
export type NotificationRuleListEnabledMutation = {
  response: NotificationRuleListEnabledMutation$data;
  variables: NotificationRuleListEnabledMutation$variables;
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
    "concreteType": "UpdateNotificationRulePayload",
    "kind": "LinkedField",
    "name": "updateNotificationRule",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationRule",
        "kind": "LinkedField",
        "name": "rule",
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
            "name": "enabled",
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
    "name": "NotificationRuleListEnabledMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleListEnabledMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "46f2f3b13171863227f4d941243996dd",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleListEnabledMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleListEnabledMutation(\n  $input: UpdateNotificationRuleInput!\n) {\n  updateNotificationRule(input: $input) {\n    rule {\n      id\n      enabled\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8498718ff86fe2e5179a2c0f41111b02";

export default node;
