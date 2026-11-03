/**
 * @generated SignedSource<<e3924a13489a529b65f51bd83a431034>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
export type UpdateRetentionPolicyInput = {
  category?: RetentionCategory | null | undefined;
  enabled?: boolean | null | undefined;
  id: string;
  retentionPeriodDays?: number | null | undefined;
};
export type RetentionPolicySettingModalUpdateMutation$variables = {
  input: UpdateRetentionPolicyInput;
};
export type RetentionPolicySettingModalUpdateMutation$data = {
  readonly adminUpdateRetentionPolicy: {
    readonly policy: {
      readonly category: RetentionCategory;
      readonly enabled: boolean;
      readonly id: string;
      readonly retentionPeriodDays: number;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type RetentionPolicySettingModalUpdateMutation = {
  response: RetentionPolicySettingModalUpdateMutation$data;
  variables: RetentionPolicySettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateRetentionPolicyPayload",
    "kind": "LinkedField",
    "name": "adminUpdateRetentionPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RetentionPolicy",
        "kind": "LinkedField",
        "name": "policy",
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
            "name": "category",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "retentionPeriodDays",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "enabled",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
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
    "name": "RetentionPolicySettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicySettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "104afbbf03cf34a555ef9b7c35d4ce17",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicySettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation RetentionPolicySettingModalUpdateMutation(\n  $input: UpdateRetentionPolicyInput!\n) {\n  adminUpdateRetentionPolicy(input: $input) {\n    policy {\n      id\n      category\n      retentionPeriodDays\n      enabled\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "287b29fd7f762c6dcc8705f7bd8e9e18";

export default node;
