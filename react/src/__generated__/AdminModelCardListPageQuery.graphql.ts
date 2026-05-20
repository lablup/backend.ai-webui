/**
 * @generated SignedSource<<d5f6aa9a5e5d6228347e3365ff37ab30>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCardV2AccessLevel = "INTERNAL" | "PUBLIC" | "%future added value";
export type ModelCardV2OrderField = "CREATED_AT" | "NAME" | "%future added value";
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
export type AdminModelCardListPageQuery$variables = {
  currentProjectId: string;
  filter?: ModelCardV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ModelCardV2OrderBy> | null | undefined;
};
export type AdminModelCardListPageQuery$data = {
  readonly adminModelCardsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessLevel: ModelCardV2AccessLevel;
        readonly createdAt: string;
        readonly domainName: string;
        readonly id: string;
        readonly metadata: {
          readonly category: string | null | undefined;
          readonly task: string | null | undefined;
          readonly title: string | null | undefined;
        };
        readonly name: string;
        readonly projectId: string;
        readonly vfolder: {
          readonly id: string;
          readonly metadata: {
            readonly name: string;
          };
          readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonV2Fragment">;
        } | null | undefined;
        readonly vfolderId: string;
        readonly " $fragmentSpreads": FragmentRefs<"AdminModelCardSettingModalFragment">;
      };
    }>;
  } | null | undefined;
  readonly group: {
    readonly type: string | null | undefined;
  } | null | undefined;
  readonly groups: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type AdminModelCardListPageQuery = {
  response: AdminModelCardListPageQuery$data;
  variables: AdminModelCardListPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "currentProjectId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
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
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderMetadataInfo",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    (v8/*: any*/)
  ],
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "domainName",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "accessLevel",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "task",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "id",
      "variableName": "currentProjectId"
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "group",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "is_active",
      "value": true
    },
    {
      "kind": "Literal",
      "name": "type",
      "value": [
        "MODEL_STORE"
      ]
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v7/*: any*/),
    (v8/*: any*/)
  ],
  "storageKey": "groups(is_active:true,type:[\"MODEL_STORE\"])"
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
    "name": "AdminModelCardListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelCardV2Connection",
        "kind": "LinkedField",
        "name": "adminModelCardsV2",
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
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v10/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "VFolderNodeIdenticonV2Fragment"
                      }
                    ],
                    "storageKey": null
                  },
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelCardV2Metadata",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AdminModelCardSettingModalFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v18/*: any*/),
      (v19/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminModelCardListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelCardV2Connection",
        "kind": "LinkedField",
        "name": "adminModelCardsV2",
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
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelCardV2Metadata",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "author",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "modelVersion",
                        "storageKey": null
                      },
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
                        "name": "architecture",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "framework",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "label",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "license",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "readme",
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
      },
      (v18/*: any*/),
      (v19/*: any*/)
    ]
  },
  "params": {
    "cacheID": "6763d668d504d9021f5bd0cf7aa7196f",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardListPageQuery",
    "operationKind": "query",
    "text": "query AdminModelCardListPageQuery(\n  $filter: ModelCardV2Filter\n  $orderBy: [ModelCardV2OrderBy!]\n  $limit: Int\n  $offset: Int\n  $currentProjectId: UUID!\n) {\n  adminModelCardsV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        name\n        vfolderId\n        vfolder {\n          id\n          metadata {\n            name\n          }\n          ...VFolderNodeIdenticonV2Fragment\n        }\n        domainName\n        projectId\n        accessLevel\n        createdAt\n        metadata {\n          title\n          category\n          task\n        }\n        ...AdminModelCardSettingModalFragment\n      }\n    }\n  }\n  group(id: $currentProjectId) {\n    type @since(version: \"24.03.0\")\n  }\n  groups(is_active: true, type: [\"MODEL_STORE\"]) {\n    id\n    name\n  }\n}\n\nfragment AdminModelCardSettingModalFragment on ModelCardV2 {\n  id\n  name\n  vfolderId\n  vfolder {\n    metadata {\n      name\n    }\n    ...VFolderNodeIdenticonV2Fragment\n    id\n  }\n  domainName\n  projectId\n  readme\n  accessLevel\n  metadata {\n    author\n    title\n    modelVersion\n    description\n    task\n    category\n    architecture\n    framework\n    label\n    license\n  }\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n"
  }
};
})();

(node as any).hash = "dffcdfde3a00eee2eacc92d15a8da12e";

export default node;
