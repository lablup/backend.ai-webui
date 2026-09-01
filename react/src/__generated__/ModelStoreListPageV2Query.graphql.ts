/**
 * @generated SignedSource<<57ca6b883b0e41987ba279ca20a9adab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCardV2OrderField = "CREATED_AT" | "NAME" | "%future added value";
export type ProjectModelCardV2Scope = {
  projectId: string;
};
export type ModelCardV2Filter = {
  AND?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  OR?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  name?: StringFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  storageHost?: StringFilter | null | undefined;
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
export type ModelCardV2OrderBy = {
  direction?: string;
  field: ModelCardV2OrderField;
};
export type ModelStoreListPageV2Query$variables = {
  filter?: ModelCardV2Filter | null | undefined;
  limit: number;
  offset: number;
  orderBy?: ReadonlyArray<ModelCardV2OrderBy> | null | undefined;
  scope: ProjectModelCardV2Scope;
};
export type ModelStoreListPageV2Query$data = {
  readonly projectModelCardsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"ModelStoreListPageV2_ModelCardV2Fragment">;
      };
    }>;
  } | null | undefined;
};
export type ModelStoreListPageV2Query = {
  response: ModelStoreListPageV2Query$data;
  variables: ModelStoreListPageV2Query$variables;
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
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v5 = [
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
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ModelStoreListPageV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelCardV2Connection",
        "kind": "LinkedField",
        "name": "projectModelCardsV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelCardV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ModelStoreListPageV2_ModelCardV2Fragment"
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
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ModelStoreListPageV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelCardV2Connection",
        "kind": "LinkedField",
        "name": "projectModelCardsV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelCardV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelCardV2Metadata",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "title",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "task",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "author",
                        "storageKey": null
                      }
                    ],
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
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
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
                    "concreteType": "DeploymentRevisionPresetConnection",
                    "kind": "LinkedField",
                    "name": "availablePresets",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/)
                    ],
                    "storageKey": "availablePresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
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
    "cacheID": "dbde5904adf578002ddc9f413150947d",
    "id": null,
    "metadata": {},
    "name": "ModelStoreListPageV2Query",
    "operationKind": "query",
    "text": "query ModelStoreListPageV2Query(\n  $scope: ProjectModelCardV2Scope!\n  $filter: ModelCardV2Filter\n  $orderBy: [ModelCardV2OrderBy!]\n  $limit: Int!\n  $offset: Int!\n) {\n  projectModelCardsV2(scope: $scope, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        ...ModelStoreListPageV2_ModelCardV2Fragment\n      }\n    }\n  }\n}\n\nfragment ModelStoreListPageV2_ModelCardV2Fragment on ModelCardV2 {\n  name\n  metadata {\n    title\n    task\n    author\n  }\n  updatedAt\n  createdAt\n  availablePresets(orderBy: [{field: RANK, direction: \"ASC\"}]) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "deba47dc7280cb92b05271fb176f72c7";

export default node;
