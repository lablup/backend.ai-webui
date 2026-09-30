/**
 * @generated SignedSource<<19eb654ef53eff64e4a34945ebd19adb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicySelectQuery$variables = {
  limit: number;
  supportsResourcePolicyV2: boolean;
};
export type UserResourcePolicySelectQuery$data = {
  readonly adminUserResourcePoliciesV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
  readonly user_resource_policies?: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  } | null | undefined> | null | undefined;
};
export type UserResourcePolicySelectQuery = {
  response: UserResourcePolicySelectQuery$data;
  variables: UserResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsResourcePolicyV2"
  }
],
v1 = [
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
    "name": "name",
    "storageKey": null
  }
],
v2 = [
  {
    "condition": "supportsResourcePolicyV2",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "limit",
            "variableName": "limit"
          },
          {
            "kind": "Literal",
            "name": "orderBy",
            "value": [
              {
                "direction": "ASC",
                "field": "NAME"
              }
            ]
          }
        ],
        "concreteType": "UserResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminUserResourcePoliciesV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserResourcePolicyV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": (v1/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  {
    "condition": "supportsResourcePolicyV2",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policies",
        "plural": true,
        "selections": (v1/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicySelectQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicySelectQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "32bd03892fcbd0c2c2ec1f7289dbd0fa",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query UserResourcePolicySelectQuery(\n  $limit: Int!\n  $supportsResourcePolicyV2: Boolean!\n) {\n  adminUserResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $supportsResourcePolicyV2) @since(version: \"26.4.2\") {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n  user_resource_policies @skip(if: $supportsResourcePolicyV2) @deprecatedSince(version: \"26.4.2\") {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "dfd7c1e93c9c0da3591b7f866896fff1";

export default node;
