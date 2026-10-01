/**
 * @generated SignedSource<<945c29ac3aa5c74a1837416cd20a7a93>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicySelectQuery$variables = {
  isSuperAdmin: boolean;
  limit: number;
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
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = [
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
v3 = [
  {
    "condition": "isSuperAdmin",
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
                "selections": (v2/*: any*/),
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
    "condition": "isSuperAdmin",
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
        "selections": (v2/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicySelectQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserResourcePolicySelectQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "d387a40f72b0c99e7443ae87d0d69561",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query UserResourcePolicySelectQuery(\n  $limit: Int!\n  $isSuperAdmin: Boolean!\n) {\n  adminUserResourcePoliciesV2(limit: $limit, orderBy: [{field: NAME, direction: ASC}]) @include(if: $isSuperAdmin) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n  user_resource_policies @skip(if: $isSuperAdmin) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "8444c4609ea91f69eca2669043c29025";

export default node;
