/**
 * @generated SignedSource<<4c19088dc215867cc96d131b1c59aaa5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ProjectResourcePolicyV2OrderField = "CREATED_AT" | "MAX_NETWORK_COUNT" | "MAX_QUOTA_SCOPE_SIZE" | "MAX_VFOLDER_COUNT" | "NAME" | "%future added value";
export type ProjectResourcePolicyV2Filter = {
  AND?: ReadonlyArray<ProjectResourcePolicyV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ProjectResourcePolicyV2Filter> | null | undefined;
  OR?: ReadonlyArray<ProjectResourcePolicyV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  maxNetworkCount?: IntFilter | null | undefined;
  maxQuotaScopeSize?: IntFilter | null | undefined;
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
export type ProjectResourcePolicyV2OrderBy = {
  direction?: OrderDirection;
  field?: ProjectResourcePolicyV2OrderField;
};
export type ProjectResourcePolicyV2Query$variables = {
  filter?: ProjectResourcePolicyV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ProjectResourcePolicyV2OrderBy> | null | undefined;
};
export type ProjectResourcePolicyV2Query$data = {
  readonly adminProjectResourcePoliciesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIProjectResourcePolicyV2TableFragment" | "ProjectResourcePolicyV2SettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type ProjectResourcePolicyV2Query = {
  response: ProjectResourcePolicyV2Query$data;
  variables: ProjectResourcePolicyV2Query$variables;
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
    "name": "ProjectResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminProjectResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectResourcePolicyV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIProjectResourcePolicyV2TableFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ProjectResourcePolicyV2SettingModalFragment"
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
    "name": "ProjectResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminProjectResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectResourcePolicyV2",
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
                    "name": "maxNetworkCount",
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
    "cacheID": "6a1b1611d6d6ba8544ae5fa969a3e5c6",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2Query",
    "operationKind": "query",
    "text": "query ProjectResourcePolicyV2Query(\n  $filter: ProjectResourcePolicyV2Filter\n  $orderBy: [ProjectResourcePolicyV2OrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminProjectResourcePoliciesV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        name\n        ...BAIProjectResourcePolicyV2TableFragment\n        ...ProjectResourcePolicyV2SettingModalFragment\n      }\n    }\n  }\n}\n\nfragment BAIProjectResourcePolicyV2TableFragment on ProjectResourcePolicyV2 {\n  id\n  name\n  createdAt\n  maxVfolderCount\n  maxQuotaScopeSize {\n    expr\n  }\n  maxNetworkCount\n}\n\nfragment ProjectResourcePolicyV2SettingModalFragment on ProjectResourcePolicyV2 {\n  id\n  name\n  maxVfolderCount\n  maxQuotaScopeSize {\n    expr\n  }\n  maxNetworkCount\n}\n"
  }
};
})();

(node as any).hash = "81d540291e86122855b5d84151d86a09";

export default node;
