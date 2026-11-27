/**
 * @generated SignedSource<<1afdbe5ec9c9328c30f3dab7775cd1e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClientIPMaskingMode = "DROP" | "NONE" | "TRUNCATE" | "%future added value";
export type ClientIPMaskingTarget = "AUDIT_LOGS" | "DEFAULT" | "LOGIN_HISTORY" | "%future added value";
export type UpsertClientIPMaskingPolicyInput = {
  ipv4Prefix?: number | null | undefined;
  ipv6Prefix?: number | null | undefined;
  mode: ClientIPMaskingMode;
  targetType: ClientIPMaskingTarget;
};
export type ClientIpMaskingPolicySettingModalUpsertMutation$variables = {
  input: UpsertClientIPMaskingPolicyInput;
};
export type ClientIpMaskingPolicySettingModalUpsertMutation$data = {
  readonly upsertClientIpMaskingPolicy: {
    readonly policy: {
      readonly entityId: string;
      readonly id: string;
      readonly ipv4Prefix: number | null | undefined;
      readonly ipv6Prefix: number | null | undefined;
      readonly mode: ClientIPMaskingMode;
      readonly targetType: ClientIPMaskingTarget;
      readonly updatedAt: string;
    };
  };
};
export type ClientIpMaskingPolicySettingModalUpsertMutation = {
  response: ClientIpMaskingPolicySettingModalUpsertMutation$data;
  variables: ClientIpMaskingPolicySettingModalUpsertMutation$variables;
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
    "concreteType": "ClientIPMaskingPolicyPayload",
    "kind": "LinkedField",
    "name": "upsertClientIpMaskingPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientIPMaskingPolicy",
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
            "name": "entityId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "targetType",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "mode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ipv4Prefix",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ipv6Prefix",
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
    "name": "ClientIpMaskingPolicySettingModalUpsertMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClientIpMaskingPolicySettingModalUpsertMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4903e7f992ab941e92a9dfc9e1ba4d94",
    "id": null,
    "metadata": {},
    "name": "ClientIpMaskingPolicySettingModalUpsertMutation",
    "operationKind": "mutation",
    "text": "mutation ClientIpMaskingPolicySettingModalUpsertMutation(\n  $input: UpsertClientIPMaskingPolicyInput!\n) {\n  upsertClientIpMaskingPolicy(input: $input) {\n    policy {\n      id\n      entityId\n      targetType\n      mode\n      ipv4Prefix\n      ipv6Prefix\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ff0f00b468438818486088279ba72ad0";

export default node;
