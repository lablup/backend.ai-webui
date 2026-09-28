/**
 * @generated SignedSource<<687bb3e5eaee6609af19df052a9d7fc4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACPermissionGridMatrixQuery$variables = Record<PropertyKey, never>;
export type RBACPermissionGridMatrixQuery$data = {
  readonly rbacEntityOperationCombinations: ReadonlyArray<{
    readonly entityType: string;
    readonly operations: ReadonlyArray<{
      readonly requiredPermission: PermissionBit;
    }>;
  }> | null | undefined;
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
export type RBACPermissionGridMatrixQuery = {
  response: RBACPermissionGridMatrixQuery$data;
  variables: RBACPermissionGridMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityType",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "requiredPermission",
    "storageKey": null
  }
],
v2 = [
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
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "OperationInfo",
            "kind": "LinkedField",
            "name": "actions",
            "plural": true,
            "selections": (v1/*: any*/),
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
    "args": null,
    "concreteType": "EntityOperationCombination",
    "kind": "LinkedField",
    "name": "rbacEntityOperationCombinations",
    "plural": true,
    "selections": [
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "OperationInfo",
        "kind": "LinkedField",
        "name": "operations",
        "plural": true,
        "selections": (v1/*: any*/),
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
    "name": "RBACPermissionGridMatrixQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RBACPermissionGridMatrixQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "546c599dbc8be570e2e52ccfb6c637f1",
    "id": null,
    "metadata": {},
    "name": "RBACPermissionGridMatrixQuery",
    "operationKind": "query",
    "text": "query RBACPermissionGridMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      entityType\n      actions {\n        requiredPermission\n      }\n    }\n  }\n  rbacEntityOperationCombinations {\n    entityType\n    operations {\n      requiredPermission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "24de54b3ed544dacb93fbaecd2cbdf32";

export default node;
