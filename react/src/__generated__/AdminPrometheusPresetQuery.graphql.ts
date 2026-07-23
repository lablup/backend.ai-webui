/**
 * @generated SignedSource<<b9c38cf8eee58b45d734c85c1c8f5647>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type QueryDefinitionOrderField = "CREATED_AT" | "NAME" | "UPDATED_AT" | "%future added value";
export type QueryDefinitionFilter = {
  AND?: ReadonlyArray<QueryDefinitionFilter> | null | undefined;
  NOT?: ReadonlyArray<QueryDefinitionFilter> | null | undefined;
  OR?: ReadonlyArray<QueryDefinitionFilter> | null | undefined;
  categoryId?: UUIDFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type QueryDefinitionOrderBy = {
  direction?: OrderDirection;
  field: QueryDefinitionOrderField;
};
export type AdminPrometheusPresetQuery$variables = {
  filter?: QueryDefinitionFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<QueryDefinitionOrderBy> | null | undefined;
};
export type AdminPrometheusPresetQuery$data = {
  readonly prometheusQueryPresets: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"PrometheusQueryPresetTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type AdminPrometheusPresetQuery = {
  response: AdminPrometheusPresetQuery$data;
  variables: AdminPrometheusPresetQuery$variables;
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
    "name": "AdminPrometheusPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "QueryDefinitionConnection",
        "kind": "LinkedField",
        "name": "prometheusQueryPresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinitionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "QueryDefinition",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "PrometheusQueryPresetTableFragment"
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
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminPrometheusPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "QueryDefinitionConnection",
        "kind": "LinkedField",
        "name": "prometheusQueryPresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinitionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "QueryDefinition",
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
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rank",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "categoryId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "metricName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "queryTemplate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "timeWindow",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "QueryDefinitionOptions",
                    "kind": "LinkedField",
                    "name": "options",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "filterLabels",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "groupLabels",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
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
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "QueryPresetCategory",
                    "kind": "LinkedField",
                    "name": "category",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v7/*: any*/)
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d064a958630b5e99af03c7761685f600",
    "id": null,
    "metadata": {},
    "name": "AdminPrometheusPresetQuery",
    "operationKind": "query",
    "text": "query AdminPrometheusPresetQuery(\n  $offset: Int\n  $limit: Int\n  $filter: QueryDefinitionFilter\n  $orderBy: [QueryDefinitionOrderBy!]\n) {\n  prometheusQueryPresets(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy) {\n    count\n    edges {\n      node {\n        id\n        ...PrometheusQueryPresetTableFragment\n      }\n    }\n  }\n}\n\nfragment PrometheusQueryPresetEditorModalFragment on QueryDefinition {\n  id\n  name\n  description\n  categoryId\n  metricName\n  queryTemplate\n  timeWindow\n  options {\n    filterLabels\n    groupLabels\n  }\n}\n\nfragment PrometheusQueryPresetTableFragment on QueryDefinition {\n  id\n  name\n  description\n  rank\n  categoryId\n  metricName\n  queryTemplate\n  timeWindow\n  options {\n    filterLabels\n    groupLabels\n  }\n  createdAt\n  updatedAt\n  category {\n    id\n    name\n  }\n  ...PrometheusQueryPresetEditorModalFragment\n}\n"
  }
};
})();

(node as any).hash = "dbbe09b8911ab3c19ae83e9a91467c68";

export default node;
