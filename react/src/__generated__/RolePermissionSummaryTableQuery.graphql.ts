/**
 * @generated SignedSource<<329981a66e3586c9d8d7e3a587614fa2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RolePermissionSummaryTableQuery$variables = {
  permissionLimit?: number | null | undefined;
  roleId: string;
};
export type RolePermissionSummaryTableQuery$data = {
  readonly adminRole: {
    readonly permissions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly entityType: string;
          readonly id: string;
          readonly permission: PermissionBit;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type RolePermissionSummaryTableQuery = {
  response: RolePermissionSummaryTableQuery$data;
  variables: RolePermissionSummaryTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionLimit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "roleId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "roleId"
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
  "args": [
    {
      "kind": "Variable",
      "name": "limit",
      "variableName": "permissionLimit"
    }
  ],
  "concreteType": "PermissionConnection",
  "kind": "LinkedField",
  "name": "permissions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PermissionEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Permission",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v3/*: any*/),
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
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RolePermissionSummaryTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v4/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RolePermissionSummaryTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "822f73e90110c752ce6633f75aba0b35",
    "id": null,
    "metadata": {},
    "name": "RolePermissionSummaryTableQuery",
    "operationKind": "query",
    "text": "query RolePermissionSummaryTableQuery(\n  $roleId: UUID!\n  $permissionLimit: Int\n) {\n  adminRole(id: $roleId) {\n    permissions(limit: $permissionLimit) {\n      edges {\n        node {\n          id\n          entityType\n          permission\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3481ff7378afac46ed480763e6d37554";

export default node;
