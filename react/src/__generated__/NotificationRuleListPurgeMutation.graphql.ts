/**
 * @generated SignedSource<<4b68c2cb68bfd8a661adb8128b701d5b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NotificationRuleListPurgeMutation$variables = {
  id: string;
};
export type NotificationRuleListPurgeMutation$data = {
  readonly purgeNotificationRule: {
    readonly entityId: string;
    readonly purgedId: string;
  };
};
export type NotificationRuleListPurgeMutation = {
  response: NotificationRuleListPurgeMutation$data;
  variables: NotificationRuleListPurgeMutation$variables;
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
    "concreteType": "PurgeNotificationRulePayload",
    "kind": "LinkedField",
    "name": "purgeNotificationRule",
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
    "name": "NotificationRuleListPurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationRuleListPurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "569b5c03b73f479b8a165fbbf8708f42",
    "id": null,
    "metadata": {},
    "name": "NotificationRuleListPurgeMutation",
    "operationKind": "mutation",
    "text": "mutation NotificationRuleListPurgeMutation(\n  $id: UUID!\n) {\n  purgeNotificationRule(id: $id) {\n    purgedId\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "8b6e31b006d574aa4ee9c055c40b8be0";

export default node;
