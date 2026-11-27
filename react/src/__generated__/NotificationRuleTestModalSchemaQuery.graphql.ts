/**
 * @generated SignedSource<<e793b1d2c61eedc8306acbf899106145>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleType = "ARTIFACT_DOWNLOAD_COMPLETED" | "ENDPOINT_LIFECYCLE_CHANGED" | "SESSION_STARTED" | "SESSION_TERMINATED" | "%future added value";
export type NotificationRuleTestModalSchemaQuery$variables = {
  ruleType: NotificationRuleType;
};
export type NotificationRuleTestModalSchemaQuery$data = {
  readonly notificationRuleTypeSchema: any | null | undefined;
};
export type NotificationRuleTestModalSchemaQuery = {
  response: NotificationRuleTestModalSchemaQuery$data;
  variables: NotificationRuleTestModalSchemaQuery$variables;
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
    "name": "NotificationRuleTestModalSchemaQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleTestModalSchemaQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c94c474188b70b1e691e93dae18263e0",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleTestModalSchemaQuery",
    "operationKind": "query",
    "text": "query NotificationRuleTestModalSchemaQuery(\n  $ruleType: NotificationRuleType!\n) {\n  notificationRuleTypeSchema(ruleType: $ruleType)\n}\n"
  }
};
})();

(node as any).hash = "bd6a3d30e1d8dbf74429616e5aebdc9c";

export default node;
