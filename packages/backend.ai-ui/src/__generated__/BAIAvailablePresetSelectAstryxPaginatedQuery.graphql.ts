/**
 * @generated SignedSource<<e67c0f50f76a3f2f1894f87e05f4b095>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentRevisionPresetFilter = {
  AND?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
  NOT?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
  OR?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
  id?: UUIDFilter | null | undefined;
  name?: StringFilter | null | undefined;
  runtimeVariantId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
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
export type BAIAvailablePresetSelectAstryxPaginatedQuery$variables = {
  filter?: DeploymentRevisionPresetFilter | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAvailablePresetSelectAstryxPaginatedQuery$data = {
  readonly deploymentRevisionPresets: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly description: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly rank: number;
        readonly runtimeVariant: {
          readonly name: string;
        } | null | undefined;
        readonly runtimeVariantId: string;
      };
    }>;
  } | null | undefined;
};
export type BAIAvailablePresetSelectAstryxPaginatedQuery = {
  response: BAIAvailablePresetSelectAstryxPaginatedQuery$data;
  variables: BAIAvailablePresetSelectAstryxPaginatedQuery$variables;
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
v3 = [
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
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "RANK"
      }
    ]
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rank",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "runtimeVariantId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAvailablePresetSelectAstryxPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DeploymentRevisionPresetConnection",
        "kind": "LinkedField",
        "name": "deploymentRevisionPresets",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentRevisionPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAvailablePresetSelectAstryxPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DeploymentRevisionPresetConnection",
        "kind": "LinkedField",
        "name": "deploymentRevisionPresets",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentRevisionPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v5/*: any*/)
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
    "cacheID": "ba6e3de518e698dfd6863cf1737961e9",
    "id": null,
    "metadata": {},
    "name": "BAIAvailablePresetSelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAvailablePresetSelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: DeploymentRevisionPresetFilter\n) {\n  deploymentRevisionPresets(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: RANK, direction: \"ASC\"}]) {\n    count\n    edges {\n      node {\n        id\n        name\n        description\n        rank\n        runtimeVariantId\n        runtimeVariant {\n          name\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0e87613646721f97a6ca7c3c0caeb4c6";

export default node;
