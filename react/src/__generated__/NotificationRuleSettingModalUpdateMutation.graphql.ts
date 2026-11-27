/**
 * @generated SignedSource<<966a376fbc67e24c9edb6182a1200146>>
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
export type NotificationRuleSettingModalUpdateMutation$variables = {
  input: UpdateNotificationRuleInput;
};
export type NotificationRuleSettingModalUpdateMutation$data = {
  readonly updateNotificationRule: {
    readonly rule: {
      readonly description: string | null | undefined;
      readonly enabled: boolean;
      readonly id: string;
      readonly messageTemplate: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type NotificationRuleSettingModalUpdateMutation = {
  response: NotificationRuleSettingModalUpdateMutation$data;
  variables: NotificationRuleSettingModalUpdateMutation$variables;
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
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "messageTemplate",
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
    "name": "NotificationRuleSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7615c3a6f4551fd1fdda0d7fa443e6f9",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleSettingModalUpdateMutation(\n  $input: UpdateNotificationRuleInput!\n) {\n  updateNotificationRule(input: $input) {\n    rule {\n      id\n      name\n      description\n      messageTemplate\n      enabled\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "836e6026b4f076dd7b3d46b465253e3c";

export default node;
