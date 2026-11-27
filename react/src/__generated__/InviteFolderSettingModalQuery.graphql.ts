/**
 * @generated SignedSource<<0a603cc27001fce84a9e050d91a73d38>>
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
export type InviteFolderSettingModalQuery$variables = {
  scope: EntityShareScope;
  vfolderId: string;
};
export type InviteFolderSettingModalQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly permissions: ReadonlyArray<PermissionBit>;
        readonly recipientEmail: string | null | undefined;
        readonly recipientEntity: {
          readonly __typename: "ProjectV2";
          readonly basicInfo: {
            readonly name: string;
          };
        } | {
          readonly __typename: "UserV2";
          readonly basicInfo: {
            readonly email: string;
          };
          readonly entityId: string;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
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
export type InviteFolderSettingModalQuery = {
  response: InviteFolderSettingModalQuery$data;
  variables: InviteFolderSettingModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "status": {
        "in": [
          "PENDING",
          "ACCEPTED"
        ]
      }
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEmail",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = {
  "kind": "InlineFragment",
  "selections": [
    (v4/*: any*/),
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectBasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
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
  "type": "ProjectV2",
  "abstractKey": null
},
v13 = {
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
        (v3/*: any*/),
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
v14 = [
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InviteFolderSettingModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
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
                        (v10/*: any*/),
                        (v11/*: any*/),
                        (v12/*: any*/)
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
      (v13/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "InviteFolderSettingModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "recipientEntity",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": (v14/*: any*/),
                        "type": "Node",
                        "abstractKey": "__isNode"
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v14/*: any*/),
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
      (v13/*: any*/)
    ]
  },
  "params": {
    "cacheID": "c9db3d2323ed3c06afad6dc25b3704fb",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalQuery",
    "operationKind": "query",
    "text": "query InviteFolderSettingModalQuery(\n  $vfolderId: UUID!\n  $scope: EntityShareScope!\n) {\n  entityShares(scope: $scope, filter: {status: {in: [PENDING, ACCEPTED]}}, limit: 100) {\n    edges {\n      node {\n        id\n        entityId\n        recipientEntityType\n        recipientEntityId\n        recipientEmail\n        status\n        permissions\n        recipientEntity {\n          __typename\n          ... on UserV2 {\n            entityId\n            basicInfo {\n              email\n            }\n          }\n          ... on ProjectV2 {\n            basicInfo {\n              name\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n      }\n    }\n  }\n  vfolderMountPolicies(vfolderId: $vfolderId) {\n    items {\n      id\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "30725a9c7909cb29df0aa2eb5f79bbfc";

export default node;
