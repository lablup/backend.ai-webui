/**
 * @generated SignedSource<<eaf644cd3d487137ffdbc277eaec45f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type SessionV2OrderField = "CREATED_AT" | "ID" | "NAME" | "STATUS" | "TERMINATED_AT" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREPARED" | "PREPARING" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Filter = {
  AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
  NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
  OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  name?: StringFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  status?: SessionV2StatusFilter | null | undefined;
  userUuid?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type SessionV2StatusFilter = {
  equals?: SessionV2Status | null | undefined;
  in?: ReadonlyArray<SessionV2Status> | null | undefined;
  notEquals?: SessionV2Status | null | undefined;
  notIn?: ReadonlyArray<SessionV2Status> | null | undefined;
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
export type SessionV2OrderBy = {
  direction?: OrderDirection;
  field: SessionV2OrderField;
};
export type ProjectAdminSessionPageQuery$variables = {
  filter?: SessionV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<SessionV2OrderBy> | null | undefined;
  projectId: string;
};
export type ProjectAdminSessionPageQuery$data = {
  readonly projectSessionsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metadata: {
          readonly name: string;
        };
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionNodesV2Fragment" | "TerminateSessionModalForProjectAdminFragment">;
      };
    }>;
  } | null | undefined;
};
export type ProjectAdminSessionPageQuery = {
  response: ProjectAdminSessionPageQuery$data;
  variables: ProjectAdminSessionPageQuery$variables;
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
  "name": "projectId"
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
    "fields": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
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
v9 = [
  (v8/*: any*/)
],
v10 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourceType",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "quantity",
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
    "name": "ProjectAdminSessionPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "projectSessionsV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2MetadataInfo",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAISessionNodesV2Fragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "TerminateSessionModalForProjectAdminFragment"
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
    "name": "ProjectAdminSessionPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "SessionV2Connection",
        "kind": "LinkedField",
        "name": "projectSessionsV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2MetadataInfo",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sessionType",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "clusterMode",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "clusterSize",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectBasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": (v9/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2LifecycleInfo",
                    "kind": "LinkedField",
                    "name": "lifecycle",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "status",
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
                        "name": "terminatedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SessionV2ResourceInfo",
                    "kind": "LinkedField",
                    "name": "resource",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "resourceGroupName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceAllocation",
                        "kind": "LinkedField",
                        "name": "allocation",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceSlot",
                            "kind": "LinkedField",
                            "name": "requested",
                            "plural": false,
                            "selections": (v10/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceSlot",
                            "kind": "LinkedField",
                            "name": "used",
                            "plural": false,
                            "selections": (v10/*: any*/),
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
                    "args": null,
                    "concreteType": "ImageV2Connection",
                    "kind": "LinkedField",
                    "name": "images",
                    "plural": false,
                    "selections": [
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
                              (v7/*: any*/),
                              {
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
                                    "name": "namespace",
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "UserV2BasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "email",
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
                    "args": null,
                    "concreteType": "KernelV2Connection",
                    "kind": "LinkedField",
                    "name": "kernels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "KernelV2Edge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "KernelV2",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "KernelV2ResourceInfo",
                                "kind": "LinkedField",
                                "name": "resource",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "agentId",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "containerId",
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
    "cacheID": "3dc36b0a32a18fe9f40af29bef580c64",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSessionPageQuery",
    "operationKind": "query",
    "text": "query ProjectAdminSessionPageQuery(\n  $projectId: UUID!\n  $filter: SessionV2Filter\n  $orderBy: [SessionV2OrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  projectSessionsV2(scope: {projectId: $projectId}, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        metadata {\n          name\n        }\n        ...BAISessionNodesV2Fragment\n        ...TerminateSessionModalForProjectAdminFragment\n      }\n    }\n  }\n}\n\nfragment BAISessionNodesV2Fragment on SessionV2 {\n  id\n  project {\n    id\n    basicInfo {\n      name\n    }\n  }\n  metadata {\n    name\n    sessionType\n    clusterMode\n    clusterSize\n  }\n  lifecycle {\n    status\n    createdAt\n    terminatedAt\n  }\n  resource {\n    resourceGroupName\n    allocation {\n      requested {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n      used {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n    }\n  }\n  images {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          namespace\n        }\n      }\n    }\n  }\n  user {\n    id\n    basicInfo {\n      email\n    }\n  }\n}\n\nfragment TerminateSessionModalForProjectAdminFragment on SessionV2 {\n  id\n  metadata {\n    name\n  }\n  kernels {\n    edges {\n      node {\n        id\n        resource {\n          agentId\n          containerId\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0319d10e5f67b53895012b3e1c631bde";

export default node;
