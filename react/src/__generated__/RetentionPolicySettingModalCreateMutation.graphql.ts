/**
 * @generated SignedSource<<f016d7bc471174f44008295f153f26ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
export type CreateRetentionPolicyInput = {
  category: RetentionCategory;
  enabled?: boolean;
  retentionPeriodDays: number;
};
export type RetentionPolicySettingModalCreateMutation$variables = {
  input: CreateRetentionPolicyInput;
};
export type RetentionPolicySettingModalCreateMutation$data = {
  readonly adminCreateRetentionPolicy: {
    readonly policy: {
      readonly id: string;
    };
  } | null | undefined;
};
export type RetentionPolicySettingModalCreateMutation = {
  response: RetentionPolicySettingModalCreateMutation$data;
  variables: RetentionPolicySettingModalCreateMutation$variables;
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
    "concreteType": "CreateRetentionPolicyPayload",
    "kind": "LinkedField",
    "name": "adminCreateRetentionPolicy",
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
    "name": "RetentionPolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3f1a90ec07bdb155f2ff4ee64d8bc0b8",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation RetentionPolicySettingModalCreateMutation(\n  $input: CreateRetentionPolicyInput!\n) {\n  adminCreateRetentionPolicy(input: $input) {\n    policy {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eeed2d302ecef7d7089624d39ba5657f";

export default node;
