/**
 * @generated SignedSource<<f78e5f01ee77255996f348604b06e6c7>>
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
  entityId?: UUIDFilter | null | undefined;
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
  requestedStartsAt?: DateTimeFilter | null | undefined;
  resourceGroupName?: StringFilter | null | undefined;
  result?: SessionV2ResultFilter | null | undefined;
  sessionGroupId?: UUIDFilter | null | undefined;
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
  fieldId?: UUIDFilter | null | undefined;
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
export type SessionStatusPanelDomainQuery$variables = {
  batch: SessionV2Filter;
  domainId: string;
  inference: SessionV2Filter;
  interactive: SessionV2Filter;
  pending: SessionV2Filter;
  running: SessionV2Filter;
  starting: SessionV2Filter;
  system: SessionV2Filter;
  terminating: SessionV2Filter;
};
export type SessionStatusPanelDomainQuery$data = {
  readonly batch: {
    readonly count: number;
  } | null | undefined;
  readonly inference: {
    readonly count: number;
  } | null | undefined;
  readonly interactive: {
    readonly count: number;
  } | null | undefined;
  readonly pending: {
    readonly count: number;
  } | null | undefined;
  readonly running: {
    readonly count: number;
  } | null | undefined;
  readonly starting: {
    readonly count: number;
  } | null | undefined;
  readonly system: {
    readonly count: number;
  } | null | undefined;
  readonly terminating: {
    readonly count: number;
  } | null | undefined;
};
export type SessionStatusPanelDomainQuery = {
  response: SessionStatusPanelDomainQuery$data;
  variables: SessionStatusPanelDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "batch"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inference"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "interactive"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pending"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "running"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "starting"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "system"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "terminating"
},
v9 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v10 = {
  "fields": [
    {
      "items": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "value",
              "variableName": "domainId"
            }
          ],
          "kind": "ObjectValue",
          "name": "domain.0"
        }
      ],
      "kind": "ListValue",
      "name": "domain"
    }
  ],
  "kind": "ObjectValue",
  "name": "scope"
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v12 = [
  {
    "alias": "pending",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "pending"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "starting",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "starting"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "running",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "running"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "terminating",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "terminating"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "interactive",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "interactive"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "batch",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "batch"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "inference",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "inference"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
    "storageKey": null
  },
  {
    "alias": "system",
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "system"
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "concreteType": "SessionV2Connection",
    "kind": "LinkedField",
    "name": "scopedSessionsV2",
    "plural": false,
    "selections": (v11/*: any*/),
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
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionStatusPanelDomainQuery",
    "selections": (v12/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v4/*: any*/),
      (v6/*: any*/),
      (v5/*: any*/),
      (v8/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionStatusPanelDomainQuery",
    "selections": (v12/*: any*/)
  },
  "params": {
    "cacheID": "8ad5db93d7029c1e0d7fb17fd34bf418",
    "id": null,
    "metadata": {},
    "name": "SessionStatusPanelDomainQuery",
    "operationKind": "query",
    "text": "query SessionStatusPanelDomainQuery(\n  $domainId: UUID!\n  $pending: SessionV2Filter!\n  $starting: SessionV2Filter!\n  $running: SessionV2Filter!\n  $terminating: SessionV2Filter!\n  $interactive: SessionV2Filter!\n  $batch: SessionV2Filter!\n  $inference: SessionV2Filter!\n  $system: SessionV2Filter!\n) {\n  pending: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $pending, limit: 1) {\n    count\n  }\n  starting: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $starting, limit: 1) {\n    count\n  }\n  running: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $running, limit: 1) {\n    count\n  }\n  terminating: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $terminating, limit: 1) {\n    count\n  }\n  interactive: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $interactive, limit: 1) {\n    count\n  }\n  batch: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $batch, limit: 1) {\n    count\n  }\n  inference: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $inference, limit: 1) {\n    count\n  }\n  system: scopedSessionsV2(scope: {domain: [{value: $domainId}]}, filter: $system, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "4625deb4afb9088893f9b93a76c63621";

export default node;
