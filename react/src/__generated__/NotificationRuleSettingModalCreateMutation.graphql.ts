/**
 * @generated SignedSource<<4d6705693f0d1b1796e40fecfe5d9d81>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type CreateNotificationRuleInput = {
  channelId: string;
  description?: string | null | undefined;
  enabled?: boolean;
  messageTemplate: string;
  name: string;
  ruleType: NotificationRuleType;
};
export type NotificationRuleSettingModalCreateMutation$variables = {
  input: CreateNotificationRuleInput;
};
export type NotificationRuleSettingModalCreateMutation$data = {
  readonly adminCreateNotificationRule: {
    readonly rule: {
      readonly entityId: string;
      readonly id: string;
    };
  } | null | undefined;
};
export type NotificationRuleSettingModalCreateMutation = {
  response: NotificationRuleSettingModalCreateMutation$data;
  variables: NotificationRuleSettingModalCreateMutation$variables;
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
    "concreteType": "CreateNotificationRulePayload",
    "kind": "LinkedField",
    "name": "adminCreateNotificationRule",
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
            "name": "entityId",
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
    "name": "NotificationRuleSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "73e296a3f21f1f6699ba1ba88e829b57",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleSettingModalCreateMutation(\n  $input: CreateNotificationRuleInput!\n) {\n  adminCreateNotificationRule(input: $input) {\n    rule {\n      id\n      entityId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ab51ee9321dadf4b12da66e3323f8db5";

export default node;
