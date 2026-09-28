/**
 * @generated SignedSource<<b7d64671b4804f4f1ebe28faf71bcaf5>>
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
    "name": "RBACPermissionGridMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RBACPermissionGridMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9580a47725b444ee510329cd965e57b4",
    "id": null,
    "metadata": {},
    "name": "RBACPermissionGridMatrixQuery",
    "operationKind": "query",
    "text": "query RBACPermissionGridMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    entities {\n      entityType\n      actions {\n        requiredPermission\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cb11ce8cccf14a2e04880fbe3b1f9a71";

export default node;
