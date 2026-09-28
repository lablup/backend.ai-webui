/**
 * @generated SignedSource<<e3eeb0da1307b514227a55dcf06e8a88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RolePresetPermissionTableQuery$variables = {
  permissionLimit?: number | null | undefined;
  rolePresetId: string;
};
export type RolePresetPermissionTableQuery$data = {
  readonly adminRolePreset: {
    readonly permissionCount: {
      readonly count: number;
    } | null | undefined;
    readonly permissionPresets: {
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
export type RolePresetPermissionTableQuery = {
  response: RolePresetPermissionTableQuery$data;
  variables: RolePresetPermissionTableQuery$variables;
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
  "name": "rolePresetId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "rolePresetId"
  }
],
v3 = {
  "alias": "permissionCount",
  "args": null,
  "concreteType": "RolePermissionPresetConnection",
  "kind": "LinkedField",
  "name": "permissionPresets",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "limit",
      "variableName": "permissionLimit"
    }
  ],
  "concreteType": "RolePermissionPresetConnection",
  "kind": "LinkedField",
  "name": "permissionPresets",
  "plural": false,
  "selections": [
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
            (v4/*: any*/),
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
    "name": "RolePresetPermissionTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "RolePreset",
        "kind": "LinkedField",
        "name": "adminRolePreset",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/)
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
    "name": "RolePresetPermissionTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "RolePreset",
        "kind": "LinkedField",
        "name": "adminRolePreset",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "292df4e9f77b5276e47d50f25ac78a3d",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableQuery",
    "operationKind": "query",
    "text": "query RolePresetPermissionTableQuery(\n  $rolePresetId: ID!\n  $permissionLimit: Int\n) {\n  adminRolePreset(id: $rolePresetId) {\n    permissionCount: permissionPresets {\n      count\n    }\n    permissionPresets(limit: $permissionLimit) {\n      edges {\n        node {\n          id\n          entityType\n          permission\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "54f4e74d63ba2a958d55729d3b69799a";

export default node;
