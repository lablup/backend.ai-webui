/**
 * @generated SignedSource<<4668ce57a66a82324314ff099ac37999>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClientIPMaskingMode = "DROP" | "NONE" | "TRUNCATE" | "%future added value";
export type ClientIPMaskingTarget = "AUDIT_LOGS" | "DEFAULT" | "LOGIN_HISTORY" | "%future added value";
export type ClientIPMaskingPolicyFilter = {
  entityId?: UUIDFilter | null | undefined;
  mode?: ClientIPMaskingMode | null | undefined;
  targetType?: ClientIPMaskingTarget | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type ClientIpMaskingPolicySettingModalTargetCheckQuery$variables = {
  filter?: ClientIPMaskingPolicyFilter | null | undefined;
};
export type ClientIpMaskingPolicySettingModalTargetCheckQuery$data = {
  readonly adminClientIpMaskingPolicies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type ClientIpMaskingPolicySettingModalTargetCheckQuery = {
  response: ClientIpMaskingPolicySettingModalTargetCheckQuery$data;
  variables: ClientIpMaskingPolicySettingModalTargetCheckQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      }
    ],
    "concreteType": "ClientIPMaskingPolicyConnection",
    "kind": "LinkedField",
    "name": "adminClientIpMaskingPolicies",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientIPMaskingPolicyEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClientIPMaskingPolicy",
            "kind": "LinkedField",
            "name": "node",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientIpMaskingPolicySettingModalTargetCheckQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClientIpMaskingPolicySettingModalTargetCheckQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7ea4e6600935a7a18539bee85bba9cfe",
    "id": null,
    "metadata": {},
    "name": "ClientIpMaskingPolicySettingModalTargetCheckQuery",
    "operationKind": "query",
    "text": "query ClientIpMaskingPolicySettingModalTargetCheckQuery(\n  $filter: ClientIPMaskingPolicyFilter\n) {\n  adminClientIpMaskingPolicies(filter: $filter, limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "adbdc2f8d8cb7cb8c23a9e9f2ddf7323";

export default node;
