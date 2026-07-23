/**
 * @generated SignedSource<<200e6326ec5656895da2dc14ce90da14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type UserResourcePolicyV2OrderField = "CREATED_AT" | "MAX_CONCURRENT_LOGINS" | "MAX_CUSTOMIZED_IMAGE_COUNT" | "MAX_QUOTA_SCOPE_SIZE" | "MAX_SESSION_COUNT_PER_MODEL_SESSION" | "MAX_VFOLDER_COUNT" | "NAME" | "%future added value";
export type UserResourcePolicyV2Filter = {
  AND?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
  NOT?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
  OR?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  maxConcurrentLogins?: IntFilter | null | undefined;
  maxCustomizedImageCount?: IntFilter | null | undefined;
  maxQuotaScopeSize?: IntFilter | null | undefined;
  maxSessionCountPerModelSession?: IntFilter | null | undefined;
  maxVfolderCount?: IntFilter | null | undefined;
  name?: StringFilter | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type UserResourcePolicyV2OrderBy = {
  direction?: OrderDirection;
  field?: UserResourcePolicyV2OrderField;
};
export type UserResourcePolicyV2Query$variables = {
  filter?: UserResourcePolicyV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<UserResourcePolicyV2OrderBy> | null | undefined;
};
export type UserResourcePolicyV2Query$data = {
  readonly adminUserResourcePoliciesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIUserResourcePolicyV2TableFragment" | "UserResourcePolicyV2SettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type UserResourcePolicyV2Query = {
  response: UserResourcePolicyV2Query$data;
  variables: UserResourcePolicyV2Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "UserResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminUserResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIUserResourcePolicyV2TableFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "UserResourcePolicyV2SettingModalFragment"
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "UserResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminUserResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxVfolderCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxConcurrentLogins",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxSessionCountPerModelSession",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "BinarySizeInfo",
                    "kind": "LinkedField",
                    "name": "maxQuotaScopeSize",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "expr",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxCustomizedImageCount",
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
    ]
  },
  "params": {
    "cacheID": "b4d6a4d0afeee1c1a05504fd9268ed2c",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2Query",
    "operationKind": "query",
    "text": "query UserResourcePolicyV2Query(\n  $filter: UserResourcePolicyV2Filter\n  $orderBy: [UserResourcePolicyV2OrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminUserResourcePoliciesV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        name\n        ...BAIUserResourcePolicyV2TableFragment\n        ...UserResourcePolicyV2SettingModalFragment\n      }\n    }\n  }\n}\n\nfragment BAIUserResourcePolicyV2TableFragment on UserResourcePolicyV2 {\n  id\n  name\n  createdAt\n  maxVfolderCount\n  maxConcurrentLogins\n  maxSessionCountPerModelSession\n  maxQuotaScopeSize {\n    expr\n  }\n  maxCustomizedImageCount\n}\n\nfragment UserResourcePolicyV2SettingModalFragment on UserResourcePolicyV2 {\n  id\n  name\n  maxVfolderCount\n  maxConcurrentLogins\n  maxSessionCountPerModelSession\n  maxQuotaScopeSize {\n    expr\n  }\n  maxCustomizedImageCount\n}\n"
  }
};
})();

(node as any).hash = "0eca06ab39c8e6b871b0fff606e5f9a6";

export default node;
