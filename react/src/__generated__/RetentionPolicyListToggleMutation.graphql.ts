/**
 * @generated SignedSource<<8cf87090aacbd453e4aeb780ff08ea03>>
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
export type RetentionPolicyListToggleMutation$variables = {
  input: UpdateRetentionPolicyInput;
};
export type RetentionPolicyListToggleMutation$data = {
  readonly adminUpdateRetentionPolicy: {
    readonly policy: {
      readonly enabled: boolean;
      readonly id: string;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type RetentionPolicyListToggleMutation = {
  response: RetentionPolicyListToggleMutation$data;
  variables: RetentionPolicyListToggleMutation$variables;
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
    "name": "RetentionPolicyListToggleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RetentionPolicyListToggleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fb9cccb4895bb77ff115a86fda078805",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicyListToggleMutation",
    "operationKind": "mutation",
    "text": "mutation RetentionPolicyListToggleMutation(\n  $input: UpdateRetentionPolicyInput!\n) {\n  adminUpdateRetentionPolicy(input: $input) {\n    policy {\n      id\n      enabled\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "89915f205ec3d8a0583e836ebdd862b5";

export default node;
