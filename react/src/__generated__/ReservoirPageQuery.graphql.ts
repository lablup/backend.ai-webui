/**
 * @generated SignedSource<<b40a7b8cc507ce1241e3bf444daf05b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type ArtifactOrderField = "NAME" | "SCANNED_AT" | "SIZE" | "TYPE" | "UPDATED_AT" | "%future added value";
export type ArtifactRegistryType = "HUGGINGFACE" | "RESERVOIR" | "%future added value";
export type ArtifactType = "IMAGE" | "MODEL" | "PACKAGE" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ArtifactOrderBy = {
  direction?: OrderDirection;
  field: ArtifactOrderField;
};
export type ArtifactFilter = {
  AND?: ReadonlyArray<ArtifactFilter> | null | undefined;
  NOT?: ReadonlyArray<ArtifactFilter> | null | undefined;
  OR?: ReadonlyArray<ArtifactFilter> | null | undefined;
  availability?: ReadonlyArray<ArtifactAvailability> | null | undefined;
  name?: StringFilter | null | undefined;
  registry?: StringFilter | null | undefined;
  source?: StringFilter | null | undefined;
  type?: ReadonlyArray<ArtifactType> | null | undefined;
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
export type ReservoirPageQuery$variables = {
  filter?: ArtifactFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  order?: ReadonlyArray<ArtifactOrderBy> | null | undefined;
};
export type ReservoirPageQuery$data = {
  readonly artifacts: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly revisions: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly id: string;
              readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactRevisionFragment">;
            };
          }>;
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment" | "BAIArtifactTableArtifactFragment" | "BAIDeactivateArtifactsModalArtifactsFragment" | "BAIImportArtifactModalArtifactFragment">;
      };
    }>;
  } | null | undefined;
  readonly defaultArtifactRegistry: {
    readonly name: string;
    readonly type: ArtifactRegistryType;
  } | null | undefined;
  readonly huggingfaceRegistries: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIHuggingFaceRegistrySettingModalFragment">;
      };
    }>;
  } | null | undefined;
  readonly total: {
    readonly count: number;
  } | null | undefined;
};
export type ReservoirPageQuery = {
  response: ReservoirPageQuery$data;
  variables: ReservoirPageQuery$variables;
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
  "name": "order"
},
v4 = [
  {
    "kind": "Literal",
    "name": "artifactType",
    "value": "MODEL"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
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
  "name": "count",
  "storageKey": null
},
v9 = {
  "alias": "total",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "availability": [
          "ALIVE",
          "DELETED"
        ]
      }
    }
  ],
  "concreteType": "ArtifactConnection",
  "kind": "LinkedField",
  "name": "artifacts",
  "plural": false,
  "selections": [
    (v8/*: any*/)
  ],
  "storageKey": "artifacts(filter:{\"availability\":[\"ALIVE\",\"DELETED\"]})"
},
v10 = [
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
    "variableName": "order"
  }
],
v11 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "VERSION"
      },
      {
        "direction": "DESC",
        "field": "UPDATED_AT"
      }
    ]
  }
],
v12 = [
  (v5/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  }
],
v13 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ArtifactRevisionEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ArtifactRevision",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "version",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
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
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReservoirPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ArtifactRegistry",
        "kind": "LinkedField",
        "name": "defaultArtifactRegistry",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": "defaultArtifactRegistry(artifactType:\"MODEL\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "HuggingFaceRegistryConnection",
        "kind": "LinkedField",
        "name": "huggingfaceRegistries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "HuggingFaceRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "HuggingFaceRegistry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIHuggingFaceRegistrySettingModalFragment"
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
      (v9/*: any*/),
      {
        "alias": null,
        "args": (v10/*: any*/),
        "concreteType": "ArtifactConnection",
        "kind": "LinkedField",
        "name": "artifacts",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIArtifactTableArtifactFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIImportArtifactModalArtifactFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIDeactivateArtifactsModalArtifactsFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIActivateArtifactsModalArtifactsFragment"
                  },
                  {
                    "alias": null,
                    "args": (v11/*: any*/),
                    "concreteType": "ArtifactRevisionConnection",
                    "kind": "LinkedField",
                    "name": "revisions",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ArtifactRevisionEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ArtifactRevision",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v7/*: any*/),
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "BAIImportArtifactModalArtifactRevisionFragment"
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
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
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ReservoirPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ArtifactRegistry",
        "kind": "LinkedField",
        "name": "defaultArtifactRegistry",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": "defaultArtifactRegistry(artifactType:\"MODEL\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "HuggingFaceRegistryConnection",
        "kind": "LinkedField",
        "name": "huggingfaceRegistries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "HuggingFaceRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "HuggingFaceRegistry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "token",
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
      (v9/*: any*/),
      {
        "alias": null,
        "args": (v10/*: any*/),
        "concreteType": "ArtifactConnection",
        "kind": "LinkedField",
        "name": "artifacts",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtifactEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Artifact",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  (v7/*: any*/),
                  (v5/*: any*/),
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
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "scannedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "availability",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SourceInfo",
                    "kind": "LinkedField",
                    "name": "registry",
                    "plural": false,
                    "selections": (v12/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SourceInfo",
                    "kind": "LinkedField",
                    "name": "source",
                    "plural": false,
                    "selections": (v12/*: any*/),
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  {
                    "alias": "latestVersion",
                    "args": (v11/*: any*/),
                    "concreteType": "ArtifactRevisionConnection",
                    "kind": "LinkedField",
                    "name": "revisions",
                    "plural": false,
                    "selections": (v13/*: any*/),
                    "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
                  },
                  {
                    "alias": null,
                    "args": (v11/*: any*/),
                    "concreteType": "ArtifactRevisionConnection",
                    "kind": "LinkedField",
                    "name": "revisions",
                    "plural": false,
                    "selections": (v13/*: any*/),
                    "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
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
    "cacheID": "542a92480107493722c41e9553c74586",
    "id": null,
    "metadata": {},
    "name": "ReservoirPageQuery",
    "operationKind": "query",
    "text": "query ReservoirPageQuery(\n  $order: [ArtifactOrderBy!]\n  $limit: Int\n  $offset: Int\n  $filter: ArtifactFilter\n) {\n  defaultArtifactRegistry(artifactType: MODEL) {\n    name\n    type\n    id\n  }\n  huggingfaceRegistries @since(version: \"25.14.0\") {\n    edges {\n      node {\n        id\n        ...BAIHuggingFaceRegistrySettingModalFragment\n      }\n    }\n  }\n  total: artifacts(filter: {availability: [ALIVE, DELETED]}) {\n    count\n  }\n  artifacts(orderBy: $order, limit: $limit, offset: $offset, filter: $filter) {\n    count\n    edges {\n      node {\n        id @since(version: \"25.17.0\")\n        ...BAIArtifactTableArtifactFragment\n        ...BAIImportArtifactModalArtifactFragment\n        ...BAIDeactivateArtifactsModalArtifactsFragment\n        ...BAIActivateArtifactsModalArtifactsFragment\n        revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n          edges {\n            node {\n              id\n              ...BAIImportArtifactModalArtifactRevisionFragment\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment BAIActivateArtifactsModalArtifactsFragment on Artifact {\n  id\n  name\n}\n\nfragment BAIArtifactDescriptionsFragment on Artifact {\n  name\n  description\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n}\n\nfragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactStatusTagFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactTableArtifactFragment on Artifact {\n  id\n  name\n  description\n  updatedAt\n  scannedAt\n  availability\n  registry {\n    name\n    url\n  }\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n  latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n    edges {\n      node {\n        id\n        version\n        size\n        status\n        ...BAIArtifactStatusTagFragment\n        ...BAIArtifactRevisionDownloadButtonFragment\n      }\n    }\n  }\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n\nfragment BAIDeactivateArtifactsModalArtifactsFragment on Artifact {\n  id\n  name\n}\n\nfragment BAIHuggingFaceRegistrySettingModalFragment on HuggingFaceRegistry {\n  id\n  token\n}\n\nfragment BAIImportArtifactModalArtifactFragment on Artifact {\n  id\n  name\n  ...BAIArtifactDescriptionsFragment\n}\n\nfragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n}\n"
  }
};
})();

(node as any).hash = "077e0b0b0d4218132cb616b6beb02f12";

export default node;
