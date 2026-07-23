/**
 * @generated SignedSource<<d9c62349bbd1b82371712d3edaaa58dc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ArtifactRemoteStatus = "AVAILABLE" | "FAILED" | "SCANNED" | "%future added value";
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type ArtifactRevisionFilter = {
  AND?: ReadonlyArray<ArtifactRevisionFilter> | null | undefined;
  NOT?: ReadonlyArray<ArtifactRevisionFilter> | null | undefined;
  OR?: ReadonlyArray<ArtifactRevisionFilter> | null | undefined;
  artifactId?: UUIDFilter | null | undefined;
  remoteStatus?: ArtifactRevisionRemoteStatusFilter | null | undefined;
  size?: IntFilter | null | undefined;
  status?: ArtifactRevisionStatusFilter | null | undefined;
  version?: StringFilter | null | undefined;
};
export type ArtifactRevisionStatusFilter = {
  equals?: ArtifactStatus | null | undefined;
  in?: ReadonlyArray<ArtifactStatus> | null | undefined;
};
export type ArtifactRevisionRemoteStatusFilter = {
  equals?: ArtifactRemoteStatus | null | undefined;
  in?: ReadonlyArray<ArtifactRemoteStatus> | null | undefined;
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
export type ReservoirArtifactDetailPageQuery$variables = {
  filter: ArtifactRevisionFilter;
  id: string;
  limit: number;
  offset: number;
};
export type ReservoirArtifactDetailPageQuery$data = {
  readonly artifact: {
    readonly description: string | null | undefined;
    readonly id: string;
    readonly latestVersion: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly size: any | null | undefined;
          readonly status: ArtifactStatus;
          readonly version: string;
          readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableLatestRevisionFragment" | "BAIImportArtifactModalArtifactRevisionFragment">;
        };
      }>;
    } | null | undefined;
    readonly name: string;
    readonly pullingArtifactRevisions: {
      readonly __id: string;
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly status: ArtifactStatus;
          readonly " $fragmentSpreads": FragmentRefs<"BAIPullingArtifactRevisionAlertFragment">;
        };
      }>;
    } | null | undefined;
    readonly registry: {
      readonly name: string | null | undefined;
      readonly url: string | null | undefined;
    };
    readonly revisions: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly status: ArtifactStatus;
          readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment" | "BAIArtifactRevisionDownloadButtonFragment" | "BAIArtifactRevisionTableArtifactRevisionFragment" | "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment" | "BAIImportArtifactModalArtifactRevisionFragment" | "ImportArtifactRevisionToFolderButtonFragment" | "ImportArtifactRevisionToFolderModalArtifactRevisionFragment">;
        };
      }>;
    } | null | undefined;
    readonly source: {
      readonly name: string | null | undefined;
      readonly url: string | null | undefined;
    };
    readonly updatedAt: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment" | "BAIDeleteArtifactRevisionsModalArtifactFragment" | "BAIImportArtifactModalArtifactFragment">;
  } | null | undefined;
  readonly groups: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalModelStoreProjectsFragment">;
  } | null | undefined> | null | undefined;
};
export type ReservoirArtifactDetailPageQuery = {
  response: ReservoirArtifactDetailPageQuery$data;
  variables: ReservoirArtifactDetailPageQuery$variables;
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
  "name": "id"
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
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
v8 = [
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  }
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "SourceInfo",
  "kind": "LinkedField",
  "name": "registry",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "SourceInfo",
  "kind": "LinkedField",
  "name": "source",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
},
v12 = {
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
},
v13 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "status": {
        "equals": "PULLING"
      }
    }
  },
  (v12/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasPreviousPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v20 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  (v12/*: any*/)
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "size",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v23 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "BAIImportArtifactModalArtifactRevisionFragment"
},
v24 = [
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
  (v12/*: any*/)
],
v25 = [
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
    "name": "ReservoirArtifactDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIArtifactTypeTagFragment"
          },
          (v7/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          {
            "alias": "pullingArtifactRevisions",
            "args": (v13/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "__ReservoirArtifactDetailPage_pullingArtifactRevisions_connection",
            "plural": false,
            "selections": [
              (v14/*: any*/),
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
                      (v5/*: any*/),
                      (v15/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIPullingArtifactRevisionAlertFragment"
                      },
                      (v16/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              (v18/*: any*/),
              (v19/*: any*/)
            ],
            "storageKey": "__ReservoirArtifactDetailPage_pullingArtifactRevisions_connection(filter:{\"status\":{\"equals\":\"PULLING\"}},orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
          },
          {
            "alias": "latestVersion",
            "args": (v20/*: any*/),
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
                      (v5/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v15/*: any*/),
                      (v23/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionTableLatestRevisionFragment"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
          },
          {
            "alias": null,
            "args": (v24/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              (v14/*: any*/),
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
                      (v5/*: any*/),
                      (v15/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionTableArtifactRevisionFragment"
                      },
                      (v23/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionDeleteButtonFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIArtifactRevisionDownloadButtonFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ImportArtifactRevisionToFolderButtonFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ImportArtifactRevisionToFolderModalArtifactRevisionFragment"
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
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIImportArtifactModalArtifactFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIDeleteArtifactRevisionsModalArtifactFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v25/*: any*/),
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ImportArtifactRevisionToFolderModalModelStoreProjectsFragment"
          }
        ],
        "storageKey": "groups(is_active:true,type:[\"MODEL_STORE\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ReservoirArtifactDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Artifact",
        "kind": "LinkedField",
        "name": "artifact",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
            "storageKey": null
          },
          (v7/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          {
            "alias": "pullingArtifactRevisions",
            "args": (v13/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              (v14/*: any*/),
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
                      (v5/*: any*/),
                      (v15/*: any*/),
                      (v22/*: any*/),
                      (v16/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              (v18/*: any*/),
              (v19/*: any*/)
            ],
            "storageKey": "revisions(filter:{\"status\":{\"equals\":\"PULLING\"}},orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
          },
          {
            "alias": "pullingArtifactRevisions",
            "args": (v13/*: any*/),
            "filters": [
              "filter",
              "orderBy"
            ],
            "handle": "connection",
            "key": "ReservoirArtifactDetailPage_pullingArtifactRevisions",
            "kind": "LinkedHandle",
            "name": "revisions"
          },
          {
            "alias": "latestVersion",
            "args": (v20/*: any*/),
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
                      (v5/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisions(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"VERSION\"},{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"}])"
          },
          {
            "alias": null,
            "args": (v24/*: any*/),
            "concreteType": "ArtifactRevisionConnection",
            "kind": "LinkedField",
            "name": "revisions",
            "plural": false,
            "selections": [
              (v14/*: any*/),
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
                      (v5/*: any*/),
                      (v15/*: any*/),
                      (v22/*: any*/),
                      (v21/*: any*/),
                      (v11/*: any*/)
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
      },
      {
        "alias": null,
        "args": (v25/*: any*/),
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": "groups(is_active:true,type:[\"MODEL_STORE\"])"
      }
    ]
  },
  "params": {
    "cacheID": "857082c87bcf47bbc7556f86a4ab6e29",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "bidirectional",
          "path": [
            "artifact",
            "pullingArtifactRevisions"
          ]
        }
      ]
    },
    "name": "ReservoirArtifactDetailPageQuery",
    "operationKind": "query",
    "text": "query ReservoirArtifactDetailPageQuery(\n  $id: ID!\n  $offset: Int!\n  $limit: Int!\n  $filter: ArtifactRevisionFilter!\n) {\n  artifact(id: $id) {\n    id\n    name\n    ...BAIArtifactTypeTagFragment\n    description\n    registry {\n      name\n      url\n    }\n    source {\n      name\n      url\n    }\n    updatedAt\n    pullingArtifactRevisions: revisions(filter: {status: {equals: PULLING}}, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n      count\n      edges {\n        node {\n          id\n          status\n          ...BAIPullingArtifactRevisionAlertFragment\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n    latestVersion: revisions(limit: 1, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          id\n          size\n          version\n          status\n          ...BAIImportArtifactModalArtifactRevisionFragment\n          ...BAIArtifactRevisionTableLatestRevisionFragment\n        }\n      }\n    }\n    revisions(offset: $offset, limit: $limit, orderBy: [{field: VERSION, direction: DESC}, {field: UPDATED_AT, direction: DESC}], filter: $filter) {\n      count\n      edges {\n        node {\n          id\n          status\n          ...BAIArtifactRevisionTableArtifactRevisionFragment\n          ...BAIImportArtifactModalArtifactRevisionFragment\n          ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment\n          ...BAIArtifactRevisionDeleteButtonFragment\n          ...BAIArtifactRevisionDownloadButtonFragment\n          ...ImportArtifactRevisionToFolderButtonFragment\n          ...ImportArtifactRevisionToFolderModalArtifactRevisionFragment\n        }\n      }\n    }\n    ...BAIImportArtifactModalArtifactFragment\n    ...BAIDeleteArtifactRevisionsModalArtifactFragment\n  }\n  groups(is_active: true, type: [\"MODEL_STORE\"]) {\n    ...ImportArtifactRevisionToFolderModalModelStoreProjectsFragment\n  }\n}\n\nfragment BAIArtifactDescriptionsFragment on Artifact {\n  name\n  description\n  source {\n    name\n    url\n  }\n  ...BAIArtifactTypeTagFragment\n}\n\nfragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactRevisionTableArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n  updatedAt\n  ...BAIArtifactStatusTagFragment\n  ...BAIArtifactRevisionDownloadButtonFragment\n  ...BAIArtifactRevisionDeleteButtonFragment\n}\n\nfragment BAIArtifactRevisionTableLatestRevisionFragment on ArtifactRevision {\n  id\n}\n\nfragment BAIArtifactStatusTagFragment on ArtifactRevision {\n  status\n}\n\nfragment BAIArtifactTypeTagFragment on Artifact {\n  type\n}\n\nfragment BAIDeleteArtifactRevisionsModalArtifactFragment on Artifact {\n  id\n  ...BAIArtifactDescriptionsFragment\n}\n\nfragment BAIDeleteArtifactRevisionsModalArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n}\n\nfragment BAIImportArtifactModalArtifactFragment on Artifact {\n  id\n  name\n  ...BAIArtifactDescriptionsFragment\n}\n\nfragment BAIImportArtifactModalArtifactRevisionFragment on ArtifactRevision {\n  id\n  version\n  size\n  status\n}\n\nfragment BAIPullingArtifactRevisionAlertFragment on ArtifactRevision {\n  id\n  status\n  version\n}\n\nfragment ImportArtifactRevisionToFolderButtonFragment on ArtifactRevision {\n  status\n}\n\nfragment ImportArtifactRevisionToFolderModalArtifactRevisionFragment on ArtifactRevision {\n  id\n}\n\nfragment ImportArtifactRevisionToFolderModalModelStoreProjectsFragment on Group {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "b72980f66c5575c9b3946d349410ddd2";

export default node;
