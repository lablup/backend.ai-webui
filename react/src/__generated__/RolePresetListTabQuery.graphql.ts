/**
 * @generated SignedSource<<ffd7e19007e7722652ef7ba7afc42b7c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RolePresetOrderField = "CREATED_AT" | "NAME" | "SCOPE_TYPE" | "UPDATED_AT" | "%future added value";
export type RolePresetFilter = {
  AND?: ReadonlyArray<RolePresetFilter> | null | undefined;
  NOT?: ReadonlyArray<RolePresetFilter> | null | undefined;
  OR?: ReadonlyArray<RolePresetFilter> | null | undefined;
  autoAssign?: boolean | null | undefined;
  deleted?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
  scopeType?: StringFilter | null | undefined;
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
export type RolePresetOrderBy = {
  direction?: OrderDirection;
  field: RolePresetOrderField;
};
export type RolePresetListTabQuery$variables = {
  filter?: RolePresetFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RolePresetOrderBy> | null | undefined;
};
export type RolePresetListTabQuery$data = {
  readonly adminRolePresets: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"RolePresetDetailDrawerFragment" | "RolePresetNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type RolePresetListTabQuery = {
  response: RolePresetListTabQuery$data;
  variables: RolePresetListTabQuery$variables;
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
};
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
    "name": "RolePresetListTabQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RolePresetConnection",
        "kind": "LinkedField",
        "name": "adminRolePresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RolePresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RolePreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RolePresetNodesFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RolePresetDetailDrawerFragment"
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
    "name": "RolePresetListTabQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RolePresetConnection",
        "kind": "LinkedField",
        "name": "adminRolePresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RolePresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RolePreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
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
                    "kind": "ScalarField",
                    "name": "scopeType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "autoAssign",
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
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RolePermissionPresetConnection",
                    "kind": "LinkedField",
                    "name": "permissionPresets",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "deleted",
                    "storageKey": null
                  },
                  {
                    "alias": "permissionEntries",
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "limit",
                        "value": 500
                      }
                    ],
                    "concreteType": "RolePermissionPresetConnection",
                    "kind": "LinkedField",
                    "name": "permissionPresets",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "RolePermissionPresetEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "RolePermissionPreset",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "entityType",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "permission",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "permissionPresets(limit:500)"
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
    "cacheID": "b4c9ff7e4fe2dd6e752bbb672d04b4df",
    "id": null,
    "metadata": {},
    "name": "RolePresetListTabQuery",
    "operationKind": "query",
    "text": "query RolePresetListTabQuery(\n  $filter: RolePresetFilter\n  $orderBy: [RolePresetOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminRolePresets(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        ...RolePresetNodesFragment\n        ...RolePresetDetailDrawerFragment\n      }\n    }\n  }\n}\n\nfragment RolePresetDetailDrawerFragment on RolePreset {\n  name\n  scopeType\n  autoAssign\n  deleted\n  createdAt\n  updatedAt\n  permissionEntries: permissionPresets(limit: 500) {\n    count\n    edges {\n      node {\n        id\n        entityType\n        permission\n      }\n    }\n  }\n  id\n}\n\nfragment RolePresetNodesFragment on RolePreset {\n  id\n  name\n  scopeType\n  autoAssign\n  createdAt\n  updatedAt\n  permissionPresets {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "3aea9bd6d0a9020ea3e58f06c66338fc";

export default node;
