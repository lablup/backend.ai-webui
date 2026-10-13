/**
 * @generated SignedSource<<a643e3f01411270561d4c1a0e815cae9>>
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
export type AdminRetentionPolicyToggleMutation$variables = {
  input: UpdateRetentionPolicyInput;
};
export type AdminRetentionPolicyToggleMutation$data = {
  readonly adminUpdateRetentionPolicy: {
    readonly policy: {
      readonly enabled: boolean;
      readonly id: string;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type AdminRetentionPolicyToggleMutation = {
  response: AdminRetentionPolicyToggleMutation$data;
  variables: AdminRetentionPolicyToggleMutation$variables;
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
    "name": "AdminRetentionPolicyToggleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminRetentionPolicyToggleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e8c34e5f32fc7f2b267bc721e8831aa4",
    "id": null,
    "metadata": {},
    "name": "AdminRetentionPolicyToggleMutation",
    "operationKind": "mutation",
    "text": "mutation AdminRetentionPolicyToggleMutation(\n  $input: UpdateRetentionPolicyInput!\n) {\n  adminUpdateRetentionPolicy(input: $input) {\n    policy {\n      id\n      enabled\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fbde690f12811e4ebe195fb314539021";

export default node;
