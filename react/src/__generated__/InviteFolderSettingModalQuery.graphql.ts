/**
 * @generated SignedSource<<21f1bc1de6c9e25338ecc1a0e2ef325d>>
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEntityType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEntityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipientEmail",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "permissions",
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
    ],
    "storageKey": null
  },
  {
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
          (v2/*: any*/),
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
  }
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
    "selections": (v3/*: any*/),
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
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "730ae65441159dcfa7afdd4af7dd1184",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalQuery",
    "operationKind": "query",
    "text": "query InviteFolderSettingModalQuery(\n  $vfolderId: UUID!\n  $scope: EntityShareScope!\n) {\n  entityShares(scope: $scope, limit: 100) {\n    edges {\n      node {\n        id\n        entityId\n        recipientEntityType\n        recipientEntityId\n        recipientEmail\n        permissions\n        status\n      }\n    }\n  }\n  vfolderMountPolicies(vfolderId: $vfolderId) {\n    items {\n      id\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5043eff7903bd8c23f94be6f9e228777";

export default node;
