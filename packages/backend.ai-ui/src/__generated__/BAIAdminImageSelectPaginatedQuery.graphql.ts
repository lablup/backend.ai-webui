/**
 * @generated SignedSource<<6d0c9d6b3a84a6b26228c1343ccee4a5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImageV2Status = "ALIVE" | "DELETED" | "%future added value";
export type ImageV2Type = "COMPUTE" | "SERVICE" | "SYSTEM" | "%future added value";
export type ImageV2Filter = {
  AND?: ReadonlyArray<ImageV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ImageV2Filter> | null | undefined;
  OR?: ReadonlyArray<ImageV2Filter> | null | undefined;
  accelerators?: StringFilter | null | undefined;
  alias?: ImageAliasNestedFilter | null | undefined;
  architecture?: StringFilter | null | undefined;
  configDigest?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  image?: StringFilter | null | undefined;
  isLocal?: boolean | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  project?: StringFilter | null | undefined;
  registry?: StringFilter | null | undefined;
  registryId?: UUIDFilter | null | undefined;
  sizeBytes?: IntFilter | null | undefined;
  status?: ImageV2StatusFilter | null | undefined;
  tag?: StringFilter | null | undefined;
  type?: ImageV2TypeFilter | null | undefined;
};
export type ImageV2StatusFilter = {
  equals?: ImageV2Status | null | undefined;
  in?: ReadonlyArray<ImageV2Status> | null | undefined;
  notEquals?: ImageV2Status | null | undefined;
  notIn?: ReadonlyArray<ImageV2Status> | null | undefined;
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
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type ImageV2TypeFilter = {
  equals?: ImageV2Type | null | undefined;
  in?: ReadonlyArray<ImageV2Type> | null | undefined;
  notEquals?: ImageV2Type | null | undefined;
  notIn?: ReadonlyArray<ImageV2Type> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type ImageAliasNestedFilter = {
  alias?: StringFilter | null | undefined;
};
export type EntityLabelNestedFilter = {
  every?: EntityLabelFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: EntityLabelFilter | null | undefined;
  some?: EntityLabelFilter | null | undefined;
};
export type EntityLabelFilter = {
  AND?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  OR?: ReadonlyArray<EntityLabelFilter> | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  key?: StringFilter | null | undefined;
  value?: StringFilter | null | undefined;
};
export type ImageSearchScope = {
  containerRegistry?: ReadonlyArray<UUIDScope> | null | undefined;
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  public?: boolean;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type BAIAdminImageSelectPaginatedQuery$variables = {
  filter?: ImageV2Filter | null | undefined;
  limit: number;
  offset: number;
  scope: ImageSearchScope;
  useScope: boolean;
};
export type BAIAdminImageSelectPaginatedQuery$data = {
  readonly adminImagesV2?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly identity: {
          readonly architecture: string;
          readonly canonicalName: string;
        };
        readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
      };
    }>;
  } | null | undefined;
  readonly scopedImagesV2?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly identity: {
          readonly architecture: string;
          readonly canonicalName: string;
        };
        readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIAdminImageSelectPaginatedQuery = {
  response: BAIAdminImageSelectPaginatedQuery$data;
  variables: BAIAdminImageSelectPaginatedQuery$variables;
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
  "name": "scope"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useScope"
},
v5 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v6 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v7 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v8 = {
  "kind": "Literal",
  "name": "orderBy",
  "value": [
    {
      "direction": "ASC",
      "field": "NAME"
    }
  ]
},
v9 = [
  (v5/*: any*/),
  (v6/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/),
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "ImageV2IdentityInfo",
  "kind": "LinkedField",
  "name": "identity",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "canonicalName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "architecture",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v13 = [
  (v10/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "ImageV2Edge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v11/*: any*/),
          (v12/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIImageNodeSimpleTagV2Fragment"
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v14 = [
  (v5/*: any*/),
  (v6/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/)
],
v15 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "key",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v16 = [
  (v10/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "ImageV2Edge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v11/*: any*/),
          (v12/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageV2MetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ImageV2TagEntry",
                "kind": "LinkedField",
                "name": "tags",
                "plural": true,
                "selections": (v15/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ImageV2LabelEntry",
                "kind": "LinkedField",
                "name": "labels",
                "plural": true,
                "selections": (v15/*: any*/),
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminImageSelectPaginatedQuery",
    "selections": [
      {
        "condition": "useScope",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v9/*: any*/),
            "concreteType": "ImageV2Connection",
            "kind": "LinkedField",
            "name": "scopedImagesV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "useScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "ImageV2Connection",
            "kind": "LinkedField",
            "name": "adminImagesV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          }
        ]
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
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminImageSelectPaginatedQuery",
    "selections": [
      {
        "condition": "useScope",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v9/*: any*/),
            "concreteType": "ImageV2Connection",
            "kind": "LinkedField",
            "name": "scopedImagesV2",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "useScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "ImageV2Connection",
            "kind": "LinkedField",
            "name": "adminImagesV2",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "5255c653de82f52cf0cd867fe28545ca",
    "id": null,
    "metadata": {},
    "name": "BAIAdminImageSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminImageSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: ImageV2Filter\n  $scope: ImageSearchScope!\n  $useScope: Boolean!\n) {\n  scopedImagesV2(scope: $scope, offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) @include(if: $useScope) @since(version: \"26.9.0a4\") {\n    count\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n        ...BAIImageNodeSimpleTagV2Fragment\n      }\n    }\n  }\n  adminImagesV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) @skip(if: $useScope) {\n    count\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n        ...BAIImageNodeSimpleTagV2Fragment\n      }\n    }\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1acf01fcfd7b022ba872e5d102a59dfe";

export default node;
