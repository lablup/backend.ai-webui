/**
 * @generated SignedSource<<9afd20a4657bf7f190671138bc650d4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyV2OrderField = "CREATED_AT" | "IDLE_TIMEOUT" | "MAX_CONCURRENT_SESSIONS" | "MAX_CONCURRENT_SFTP_SESSIONS" | "MAX_CONTAINERS_PER_SESSION" | "MAX_PENDING_SESSION_COUNT" | "MAX_SESSION_LIFETIME" | "NAME" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type KeypairResourcePolicyV2Filter = {
  AND?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  NOT?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  OR?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  idleTimeout?: IntFilter | null | undefined;
  keypair?: KeypairResourcePolicyKeypairNestedFilter | null | undefined;
  maxConcurrentSessions?: IntFilter | null | undefined;
  maxConcurrentSftpSessions?: IntFilter | null | undefined;
  maxContainersPerSession?: IntFilter | null | undefined;
  maxPendingSessionCount?: IntFilter | null | undefined;
  maxSessionLifetime?: IntFilter | null | undefined;
  name?: StringFilter | null | undefined;
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
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type KeypairResourcePolicyKeypairNestedFilter = {
  userId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type KeypairResourcePolicyV2OrderBy = {
  direction?: OrderDirection;
  field?: KeypairResourcePolicyV2OrderField;
};
export type KeypairResourcePolicyV2Query$variables = {
  filter?: KeypairResourcePolicyV2Filter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<KeypairResourcePolicyV2OrderBy> | null | undefined;
};
export type KeypairResourcePolicyV2Query$data = {
  readonly adminKeypairResourcePoliciesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIKeypairResourcePolicyV2TableFragment" | "KeypairResourcePolicyV2SettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type KeypairResourcePolicyV2Query = {
  response: KeypairResourcePolicyV2Query$data;
  variables: KeypairResourcePolicyV2Query$variables;
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
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = [
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
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "unlimited",
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
    "name": "KeypairResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "KeypairResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "KeypairResourcePolicyV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIKeypairResourcePolicyV2TableFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "KeypairResourcePolicyV2SettingModalFragment"
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
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "KeypairResourcePolicyV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "KeypairResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "KeypairResourcePolicyV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
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
                    "name": "defaultForUnspecified",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceLimitEntry",
                    "kind": "LinkedField",
                    "name": "totalResourceSlots",
                    "plural": true,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxSessionLifetime",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxConcurrentSessions",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxPendingSessionCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceLimitEntry",
                    "kind": "LinkedField",
                    "name": "maxPendingSessionResourceSlots",
                    "plural": true,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxConcurrentSftpSessions",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxContainersPerSession",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "idleTimeout",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolderHostPermissionEntry",
                    "kind": "LinkedField",
                    "name": "allowedVfolderHosts",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "host",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "permissions",
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
    "cacheID": "d95b434b6daa4ce53779845b1950d5af",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyV2Query",
    "operationKind": "query",
    "text": "query KeypairResourcePolicyV2Query(\n  $filter: KeypairResourcePolicyV2Filter\n  $orderBy: [KeypairResourcePolicyV2OrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminKeypairResourcePoliciesV2(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        name\n        ...BAIKeypairResourcePolicyV2TableFragment\n        ...KeypairResourcePolicyV2SettingModalFragment\n      }\n    }\n  }\n}\n\nfragment BAIKeypairResourcePolicyV2TableFragment on KeypairResourcePolicyV2 {\n  id\n  name\n  createdAt\n  defaultForUnspecified\n  totalResourceSlots {\n    resourceType\n    quantity\n    unlimited\n  }\n  maxSessionLifetime\n  maxConcurrentSessions\n  maxPendingSessionCount\n  maxPendingSessionResourceSlots {\n    resourceType\n    quantity\n    unlimited\n  }\n  maxConcurrentSftpSessions\n  maxContainersPerSession\n  idleTimeout\n  allowedVfolderHosts {\n    host\n    permissions\n  }\n}\n\nfragment KeypairResourcePolicyV2SettingModalFragment on KeypairResourcePolicyV2 {\n  id\n  name\n  defaultForUnspecified\n  totalResourceSlots {\n    resourceType\n    quantity\n    unlimited\n  }\n  maxSessionLifetime\n  maxConcurrentSessions\n  maxContainersPerSession\n  idleTimeout\n  maxPendingSessionCount\n  maxConcurrentSftpSessions\n  allowedVfolderHosts {\n    host\n    permissions\n  }\n}\n"
  }
};
})();

(node as any).hash = "3fb91a8d04f84d0b90bec4cfc017d569";

export default node;
