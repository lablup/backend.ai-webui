/**
 * @generated SignedSource<<a11af138bc1eb472c058b6b25ca21529>>
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
          (v4/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b590c573ed382a8591da77161cecfa11",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableQuery",
    "operationKind": "query",
    "text": "query RolePresetPermissionTableQuery(\n  $rolePresetId: ID!\n  $permissionLimit: Int\n) {\n  adminRolePreset(id: $rolePresetId) {\n    permissionPresets(limit: $permissionLimit) {\n      edges {\n        node {\n          id\n          entityType\n          permission\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "14f6e9b86b7f15025f112aa3368ce312";

export default node;
