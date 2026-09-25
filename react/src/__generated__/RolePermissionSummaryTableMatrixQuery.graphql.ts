/**
 * @generated SignedSource<<a069e3e373baff5cb83325b9135cfd57>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RolePermissionSummaryTableMatrixQuery$variables = Record<PropertyKey, never>;
export type RolePermissionSummaryTableMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly entities: ReadonlyArray<{
      readonly actions: ReadonlyArray<{
        readonly requiredPermission: PermissionBit;
      }>;
      readonly entityType: string;
    }>;
    readonly scopeType: string;
  }> | null | undefined;
};
export type RolePermissionSummaryTableMatrixQuery = {
  response: RolePermissionSummaryTableMatrixQuery$data;
  variables: RolePermissionSummaryTableMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ScopeEntityOperationCombination",
    "kind": "LinkedField",
    "name": "rbacPermissionMatrix",
    "plural": true,
    "selections": [
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
        "concreteType": "EntityActionInfo",
        "kind": "LinkedField",
        "name": "entities",
        "plural": true,
        "selections": [
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
            "concreteType": "OperationInfo",
            "kind": "LinkedField",
            "name": "actions",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "requiredPermission",
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RolePermissionSummaryTableMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RolePermissionSummaryTableMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "4836a7061cd7923a6442b87c8458f41d",
    "id": null,
    "metadata": {},
    "name": "RolePermissionSummaryTableMatrixQuery",
    "operationKind": "query",
    "text": "query RolePermissionSummaryTableMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      entityType\n      actions {\n        requiredPermission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ed0826d2501d6caefdea711f5fe304e";

export default node;
