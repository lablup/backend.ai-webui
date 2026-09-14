/**
 * @generated SignedSource<<708da003d8db349dba3bf07882948d16>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImageV2Status = "ALIVE" | "DELETED" | "%future added value";
export type ImageV2Filter = {
  AND?: ReadonlyArray<ImageV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ImageV2Filter> | null | undefined;
  OR?: ReadonlyArray<ImageV2Filter> | null | undefined;
  alias?: ImageAliasNestedFilter | null | undefined;
  architecture?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  registryId?: UUIDFilter | null | undefined;
  status?: ImageV2StatusFilter | null | undefined;
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
export type ImageAliasNestedFilter = {
  alias?: StringFilter | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type BAIAdminImageSelectPaginatedQuery$variables = {
  filter?: ImageV2Filter | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAdminImageSelectPaginatedQuery$data = {
  readonly adminImagesV2: {
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
        "field": "NAME"
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
  "name": "canonicalName",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v8 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminImageSelectPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ImageV2Connection",
        "kind": "LinkedField",
        "name": "adminImagesV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageV2IdentityInfo",
                    "kind": "LinkedField",
                    "name": "identity",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  },
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
    "name": "BAIAdminImageSelectPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ImageV2Connection",
        "kind": "LinkedField",
        "name": "adminImagesV2",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageV2IdentityInfo",
                    "kind": "LinkedField",
                    "name": "identity",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "namespace",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
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
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ImageV2LabelEntry",
                        "kind": "LinkedField",
                        "name": "labels",
                        "plural": true,
                        "selections": (v8/*: any*/),
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a364728306ef2c92bf378950afec532c",
    "id": null,
    "metadata": {},
    "name": "BAIAdminImageSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminImageSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: ImageV2Filter\n) {\n  adminImagesV2(offset: $offset, limit: $limit, filter: $filter, orderBy: [{field: NAME, direction: ASC}]) {\n    count\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n        ...BAIImageNodeSimpleTagV2Fragment\n      }\n    }\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    namespace\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9d7e11f9ecc26940c3a3317eb188cb83";

export default node;
