/**
 * @generated SignedSource<<afa3e2f4d292038b65f03dfca9d90613>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type NotificationRulePreviewModalSchemaQuery$variables = {
  ruleType: NotificationRuleType;
};
export type NotificationRulePreviewModalSchemaQuery$data = {
  readonly notificationRuleTypeSchema: any | null | undefined;
};
export type NotificationRulePreviewModalSchemaQuery = {
  response: NotificationRulePreviewModalSchemaQuery$data;
  variables: NotificationRulePreviewModalSchemaQuery$variables;
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
    "name": "NotificationRulePreviewModalSchemaQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRulePreviewModalSchemaQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "df8cacffd05da3978e976cafa4ae3648",
    "id": null,
    "metadata": {},
    "name": "NotificationRulePreviewModalSchemaQuery",
    "operationKind": "query",
    "text": "query NotificationRulePreviewModalSchemaQuery(\n  $ruleType: NotificationRuleType!\n) {\n  notificationRuleTypeSchema(ruleType: $ruleType)\n}\n"
  }
};
})();

(node as any).hash = "5ca2e5ee2f699ddad63e8bcc3a974497";

export default node;
