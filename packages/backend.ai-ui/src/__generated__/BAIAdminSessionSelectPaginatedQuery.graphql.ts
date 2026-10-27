/**
 * @generated SignedSource<<35e3d22704c717d42e965a4bd167d69c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionV2NetworkType = "HOST" | "PERSISTENT" | "VOLATILE" | "%future added value";
export type SessionV2Result = "FAILURE" | "SUCCESS" | "UNDEFINED" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RESERVED" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type SessionV2Filter = {
  AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
  NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
  OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  batchTimeout?: IntFilter | null | undefined;
  clusterSize?: IntFilter | null | undefined;
  creationId?: StringFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  isPreemptible?: boolean | null | undefined;
  jobPriority?: IntFilter | null | undefined;
  labels?: EntityLabelNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  networkId?: StringFilter | null | undefined;
  networkType?: SessionV2NetworkTypeFilter | null | undefined;
  priority?: IntFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  replicaId?: UUIDFilter | null | undefined;
  resourceGroupName?: StringFilter | null | undefined;
  result?: SessionV2ResultFilter | null | undefined;
  sessionType?: SessionV2TypeFilter | null | undefined;
  startsAt?: DateTimeFilter | null | undefined;
  status?: SessionV2StatusFilter | null | undefined;
  tag?: StringFilter | null | undefined;
  terminatedAt?: DateTimeFilter | null | undefined;
  tier?: IntFilter | null | undefined;
  useHostNetwork?: boolean | null | undefined;
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
export type SessionV2TypeFilter = {
  equals?: SessionV2Type | null | undefined;
  in?: ReadonlyArray<SessionV2Type> | null | undefined;
  notEquals?: SessionV2Type | null | undefined;
  notIn?: ReadonlyArray<SessionV2Type> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type SessionV2ResultFilter = {
  equals?: SessionV2Result | null | undefined;
  in?: ReadonlyArray<SessionV2Result> | null | undefined;
  notEquals?: SessionV2Result | null | undefined;
  notIn?: ReadonlyArray<SessionV2Result> | null | undefined;
};
export type SessionV2NetworkTypeFilter = {
  equals?: SessionV2NetworkType | null | undefined;
  in?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
  notEquals?: SessionV2NetworkType | null | undefined;
  notIn?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
};
export type BAIAdminSessionSelectPaginatedQuery$variables = {
  filter?: SessionV2Filter | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAdminSessionSelectPaginatedQuery$data = {
  readonly adminSessionsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metadata: {
          readonly name: string;
        };
      };
    }>;
  } | null | undefined;
};
export type BAIAdminSessionSelectPaginatedQuery = {
  response: BAIAdminSessionSelectPaginatedQuery$data;
  variables: BAIAdminSessionSelectPaginatedQuery$variables;
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
    "alias": null,
    "args": [
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
      }
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "adminSessionsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionV2MetadataInfo",
                "kind": "LinkedField",
                "name": "metadata",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
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
    "name": "BAIAdminSessionSelectPaginatedQuery",
    "selections": (v3/*: any*/),
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
    "name": "BAIAdminSessionSelectPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "030a6e61afe8935dcfb7c09de981e719",
    "id": null,
    "metadata": {},
    "name": "BAIAdminSessionSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminSessionSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: SessionV2Filter\n) {\n  adminSessionsV2(offset: $offset, limit: $limit, filter: $filter) {\n    count\n    edges {\n      node {\n        id\n        metadata {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b620fe51cc5248b21337227de4c3ba6d";

export default node;
