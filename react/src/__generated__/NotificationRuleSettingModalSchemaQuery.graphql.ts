/**
 * @generated SignedSource<<19d9930c37e9ee28ac64a2d0b67cb7f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type NotificationRuleSettingModalSchemaQuery$variables = {
  ruleType: NotificationRuleType;
};
export type NotificationRuleSettingModalSchemaQuery$data = {
  readonly notificationRuleTypeSchema: any | null | undefined;
};
export type NotificationRuleSettingModalSchemaQuery = {
  response: NotificationRuleSettingModalSchemaQuery$data;
  variables: NotificationRuleSettingModalSchemaQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ruleType"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "ruleType",
        "variableName": "ruleType"
      }
    ],
    "kind": "ScalarField",
    "name": "notificationRuleTypeSchema",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationRuleSettingModalSchemaQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleSettingModalSchemaQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "463cdf997905f35257214a66b4579855",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleSettingModalSchemaQuery",
    "operationKind": "query",
    "text": "query NotificationRuleSettingModalSchemaQuery(\n  $ruleType: NotificationRuleType!\n) {\n  notificationRuleTypeSchema(ruleType: $ruleType)\n}\n"
  }
};
})();

(node as any).hash = "b2a82037025b4d760da8f85efe3e5cf1";

export default node;
