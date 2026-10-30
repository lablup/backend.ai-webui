/**
 * @generated SignedSource<<4c1fee22fa28b5698c82d25e98d95bfa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type EntityShareScope = {
  recipient?: ReadonlyArray<UUIDScope> | null | undefined;
  recipientProject?: ReadonlyArray<UUIDScope> | null | undefined;
  sharer?: ReadonlyArray<UUIDScope> | null | undefined;
  target?: ReadonlyArray<EntityShareTargetScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type EntityShareTargetScope = {
  entityId: string;
  entityType: string;
};
export type EntityShareFilter = {
  entityId?: UUIDFilter | null | undefined;
  recipientEmail?: StringFilter | null | undefined;
  recipientEntityId?: UUIDFilter | null | undefined;
  status?: EntityShareStatusFilter | null | undefined;
  targetEntityId?: UUIDFilter | null | undefined;
};
export type EntityShareStatusFilter = {
  equals?: EntityShareStatus | null | undefined;
  in?: ReadonlyArray<EntityShareStatus> | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
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
export type InviteFolderSettingModalExistingShareQuery$variables = {
  filter?: EntityShareFilter | null | undefined;
  scope: EntityShareScope;
  vfolderId: string;
};
export type InviteFolderSettingModalExistingShareQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly permissions: ReadonlyArray<PermissionBit>;
        readonly recipientEmail: string | null | undefined;
        readonly recipientEntity: {
          readonly basicInfo?: {
            readonly email: string;
          };
          readonly entityId?: string;
        } | null | undefined;
        readonly recipientEntityId: string | null | undefined;
        readonly recipientEntityType: string | null | undefined;
        readonly status: EntityShareStatus;
      };
    }>;
  } | null | undefined;
  readonly vfolderMountPolicies: {
    readonly items: ReadonlyArray<{
      readonly id: string;
      readonly permission: VFolderMountPermission;
      readonly userId: string;
    }>;
  } | null | undefined;
};
export type InviteFolderSettingModalExistingShareQuery = {
  response: InviteFolderSettingModalExistingShareQuery$data;
  variables: InviteFolderSettingModalExistingShareQuery$variables;
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
  "name": "scope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v3 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 10
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityType",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEmail",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v11 = {
  "kind": "InlineFragment",
  "selections": [
    (v5/*: any*/),
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
  "type": "UserV2",
  "abstractKey": null
},
v12 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "vfolderId",
      "variableName": "vfolderId"
    }
  ],
  "concreteType": "VFolderMountPoliciesPayload",
  "kind": "LinkedField",
  "name": "vfolderMountPolicies",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderMountPolicy",
      "kind": "LinkedField",
      "name": "items",
      "plural": true,
      "selections": [
        (v4/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "userId",
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
},
v13 = [
  (v4/*: any*/)
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
    "name": "InviteFolderSettingModalExistingShareQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "kind": "CatchField",
                    "field": {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "recipientEntity",
                      "plural": false,
                      "selections": [
                        (v11/*: any*/)
                      ],
                      "storageKey": null
                    },
                    "to": "NULL"
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
      (v12/*: any*/)
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
    "name": "InviteFolderSettingModalExistingShareQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "recipientEntity",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      (v11/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": (v13/*: any*/),
                        "type": "Node",
                        "abstractKey": "__isNode"
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v13/*: any*/),
                        "type": "ArtifactRegistry",
                        "abstractKey": null
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
      (v12/*: any*/)
    ]
  },
  "params": {
    "cacheID": "b610ca760c24a3bcc0bfc0dfb14aed51",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalExistingShareQuery",
    "operationKind": "query",
    "text": "query InviteFolderSettingModalExistingShareQuery(\n  $vfolderId: UUID!\n  $scope: EntityShareScope!\n  $filter: EntityShareFilter\n) {\n  entityShares(scope: $scope, filter: $filter, limit: 10) {\n    edges {\n      node {\n        id\n        entityId\n        recipientEntityType\n        recipientEntityId\n        recipientEmail\n        status\n        permissions\n        recipientEntity {\n          __typename\n          ... on UserV2 {\n            entityId\n            basicInfo {\n              email\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n      }\n    }\n  }\n  vfolderMountPolicies(vfolderId: $vfolderId) {\n    items {\n      id\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a9047907d99163c2d03a7c0313f4d1dd";

export default node;
