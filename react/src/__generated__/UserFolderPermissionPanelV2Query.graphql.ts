/**
 * @generated SignedSource<<dedd9173f1132b85b34c2133f4526604>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyV2Filter = {
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
export type KeypairFilter = {
  AND?: ReadonlyArray<KeypairFilter> | null | undefined;
  NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
  OR?: ReadonlyArray<KeypairFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  userId?: UUIDFilter | null | undefined;
};
export type UserFolderPermissionPanelV2Query$variables = {
  filter?: KeypairResourcePolicyV2Filter | null | undefined;
  includeKeypairs: boolean;
  keypairFilter?: KeypairFilter | null | undefined;
  limit: number;
  offset: number;
};
export type UserFolderPermissionPanelV2Query$data = {
  readonly adminKeypairResourcePoliciesV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt">;
      };
    }>;
  } | null | undefined;
};
export type UserFolderPermissionPanelV2Query = {
  response: UserFolderPermissionPanelV2Query$data;
  variables: UserFolderPermissionPanelV2Query$variables;
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
  "name": "includeKeypairs"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "keypairFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
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
    "name": "UserFolderPermissionPanelV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "KeypairResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
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
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt"
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
      (v4/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserFolderPermissionPanelV2Query",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "KeypairResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePoliciesV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
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
                  },
                  {
                    "condition": "includeKeypairs",
                    "kind": "Condition",
                    "passingValue": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "filter",
                            "variableName": "keypairFilter"
                          }
                        ],
                        "concreteType": "KeyPairConnection",
                        "kind": "LinkedField",
                        "name": "keypairs",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "KeyPairV2Edge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "KeyPairV2",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v7/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "accessKey",
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
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "UserV2OrganizationInfo",
                                        "kind": "LinkedField",
                                        "name": "organization",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "mainAccessKey",
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      },
                                      (v7/*: any*/)
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
    "cacheID": "d760e1e5e20eefd0823d90916d0e7c53",
    "id": null,
    "metadata": {},
    "name": "UserFolderPermissionPanelV2Query",
    "operationKind": "query",
    "text": "query UserFolderPermissionPanelV2Query(\n  $filter: KeypairResourcePolicyV2Filter\n  $limit: Int!\n  $offset: Int!\n  $includeKeypairs: Boolean!\n  $keypairFilter: KeypairFilter\n) {\n  adminKeypairResourcePoliciesV2(filter: $filter, limit: $limit, offset: $offset, orderBy: [{field: NAME, direction: ASC}]) {\n    count\n    edges {\n      node {\n        ...KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt\n        id\n      }\n    }\n  }\n}\n\nfragment KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt on KeypairResourcePolicyV2 {\n  id\n  name\n  allowedVfolderHosts {\n    host\n    permissions\n  }\n  keypairs(filter: $keypairFilter) @include(if: $includeKeypairs) {\n    edges {\n      node {\n        id\n        accessKey\n        user {\n          organization {\n            mainAccessKey\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea68f8436af7e34d142a42b103330f26";

export default node;
